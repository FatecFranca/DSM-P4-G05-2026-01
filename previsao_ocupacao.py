import os
import pandas as pd
import numpy as np
from pymongo import MongoClient
from sklearn.linear_model import LinearRegression
import statsmodels.api as sm
import plotly.express as px
import plotly.graph_objects as go
import json
from dotenv import load_dotenv
load_dotenv(os.path.join("backend", ".env"))
MONGO_URI = os.getenv("DATABASE_URL")
if not MONGO_URI:
    MONGO_URI = "mongodb+srv://PI2026:pi2026@cluster0.qztwjzy.mongodb.net/pi2026?appName=Cluster0"
print("Connecting to MongoDB...")
try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    client.admin.command('ismaster')
    db = client.get_database()
    print("Fetching data...")
    gyms = list(db.Gym.find({}, {"name": 1, "capacity": 1}))
    events = list(db.IoTEvent.find({}, {"gymName": 1, "eventType": 1, "receivedAt": 1, "occurredAt": 1}))
except Exception as e:
    print(f"Failed to connect to MongoDB ({e}). Falling back to mock data.")
    gyms = []
    events = []
if not events:
    print("No events found in database! Creating mock data for demonstration.")
    # Create mock data
    import datetime
    np.random.seed(42)
    gym_names = ["SmartFit - Centro", "BlueFit - Paulista"]
    gyms = [{"name": gym_names[0], "capacity": 200}, {"name": gym_names[1], "capacity": 300}]
    events = []
    base_date = datetime.datetime.now() - datetime.timedelta(days=30)
    for _ in range(5000):
        hour = int(np.random.normal(18, 4)) % 24
        if hour < 6: hour += 6
        events.append({
            "gymName": np.random.choice(gym_names),
            "eventType": "checkin",
            "receivedAt": base_date + datetime.timedelta(days=np.random.randint(0, 30), hours=hour, minutes=np.random.randint(0, 60))
        })
print(f"Loaded {len(events)} events.")
df_events = pd.DataFrame(events)
df_events['finalAt'] = df_events.get('occurredAt', pd.Series(dtype='datetime64[ns]')).combine_first(df_events.get('receivedAt', pd.Series(dtype='datetime64[ns]')))
df_events['finalAt'] = pd.to_datetime(df_events['finalAt'])
df_events['hora'] = df_events['finalAt'].dt.hour
df_events['dia_semana_num'] = df_events['finalAt'].dt.dayofweek
df_events['dia_data'] = df_events['finalAt'].dt.date

df_checkins = df_events[df_events['eventType'] == 'checkin']

agrupado = df_checkins.groupby(['gymName', 'dia_data', 'dia_semana_num', 'hora']).size().reset_index(name='checkins')

capacidades = {g['name']: g.get('capacity', 100) for g in gyms}

agrupado['capacidade'] = agrupado['gymName'].map(capacidades)
agrupado['lotacao_pct'] = (agrupado['checkins'] / agrupado['capacidade']) * 100
best_times = {}
fig = go.Figure()
dias_nome = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
for gym in agrupado['gymName'].unique():
    print(f"\n--- Analisando Academia: {gym} ---")
    df_gym = agrupado[agrupado['gymName'] == gym]
    if len(df_gym) < 2:
        print(f"Not enough data points for {gym}. Generating empty heatmap...")
        futuro = []
        for d in range(7):
            for h in range(6, 23):
                futuro.append({'dia_semana_num': d, 'hora': h, 'lotacao_prevista': 0})
        df_futuro = pd.DataFrame(futuro)
        best_times_str = "Sem dados suficientes"
        best_times[gym] = best_times_str
    else:
        X = df_gym[['dia_semana_num', 'hora']]
        y = df_gym['lotacao_pct']

        X_const = sm.add_constant(X)
        modelo_stats = sm.OLS(y, X_const).fit()
        print("=== OLS Regression Summary ===")
        print(modelo_stats.summary())

        model = LinearRegression()
        model.fit(X, y)

        futuro = []
        for d in range(7):
            for h in range(6, 23):
                futuro.append({'dia_semana_num': d, 'hora': h})
        df_futuro = pd.DataFrame(futuro)
        df_futuro['lotacao_prevista'] = model.predict(df_futuro[['dia_semana_num', 'hora']])
        df_futuro['lotacao_prevista'] = df_futuro['lotacao_prevista'].clip(lower=0)
        
        avg_per_hour = df_futuro.groupby('hora')['lotacao_prevista'].mean()
        lowest_hours = avg_per_hour.nsmallest(2).index.tolist()
        lowest_hours.sort()
        best_times_str = " || ".join([f"{h}:00 - {h+2}:00" for h in lowest_hours])
        best_times[gym] = best_times_str
        print(f"Best times for {gym}: {best_times_str}")

    df_futuro['dia_semana'] = df_futuro['dia_semana_num'].apply(lambda x: dias_nome[x])
    pivot_futuro = df_futuro.pivot_table(values='lotacao_prevista', index='dia_semana', columns='hora')
    pivot_futuro = pivot_futuro.reindex(dias_nome)

    os.makedirs("front/public/heatmaps", exist_ok=True)
    fig_heat = px.imshow(pivot_futuro, 
                         labels=dict(x="Hora do Dia", y="Dia da Semana", color="Lotação Prevista (%)"),
                         title=f"Previsão de Lotação Futura - {gym}<br>Melhor horário: {best_times_str}",
                         text_auto=".0f", aspect="auto", color_continuous_scale='RdYlGn_r')
    fig_heat.write_html(f"front/public/heatmaps/previsao_heatmap_{gym.replace(' ', '_')}.html")
    print(f"Saved heatmap graphic for {gym}.")

    df_futuro['gymName'] = gym
    if 'todas_previsoes' not in locals():
        todas_previsoes = []
    todas_previsoes.extend(df_futuro.to_dict('records'))

os.makedirs("front/src/data", exist_ok=True)
json_path = "front/src/data/best_times.json"
with open(json_path, 'w') as f:
    json.dump(best_times, f, indent=4)
print(f"\nBest times saved to {json_path}")

prev_path = "front/src/data/previsao_futura.json"
if 'todas_previsoes' in locals():
    with open(prev_path, 'w') as f:
        json.dump(todas_previsoes, f, indent=4)
    print(f"Future predictions saved to {prev_path}")
