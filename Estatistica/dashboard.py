import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import os
st.set_page_config(page_title="Dashboard GymRadar IoT", page_icon="🏋️‍♂️", layout="wide")
st.title("🏋️‍♂️ Dashboard de Acessos IoT - GymRadar")
st.markdown("Análise estatística e acompanhamento de fluxo de alunos em tempo real usando dados reais dos dispositivos de catraca IoT.")
@st.cache_data
def carregar_dados():
    caminho = "resultados_reais/dados_agrupados_pbi.csv"
    if not os.path.exists(caminho):
        st.error(f"Arquivo não encontrado em: {caminho}. Por favor, rode o script analise_estatistica.py primeiro.")
        return pd.DataFrame()
    df = pd.read_csv(caminho)
    ordem_dias = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    df['dia_semana'] = pd.Categorical(df['dia_semana'], categories=ordem_dias, ordered=True)
    return df
df = carregar_dados()
if not df.empty:
    st.sidebar.header("Filtros")
    unidades = st.sidebar.multiselect("Selecione a(s) Unidade(s):", options=df['gymName'].unique(), default=df['gymName'].unique())
    df_filtrado = df[df['gymName'].isin(unidades)]
    st.markdown("### 📊 Indicadores Globais")
    col1, col2, col3, col4 = st.columns(4)
    total_checkins = df_filtrado['checkins'].sum()
    media_hora = df_filtrado['checkins'].mean()
    mediana_hora = df_filtrado['checkins'].median()
    df_filtrado['horario_pico'] = df_filtrado['hora'].isin([18, 19, 20])
    pico_checkins = df_filtrado[df_filtrado['horario_pico']]['checkins'].sum()
    pct_pico = (pico_checkins / total_checkins * 100) if total_checkins > 0 else 0
    col1.metric("Total de Check-ins", f"{total_checkins:,.0f}")
    col2.metric("Média de Check-ins/Hora", f"{media_hora:.1f}")
    col3.metric("Mediana/Hora", f"{mediana_hora:.1f}")
    col4.metric("% Acessos no Horário de Pico", f"{pct_pico:.1f}%")
    st.divider()
    col_esquerda, col_direita = st.columns(2)
    with col_esquerda:
        st.subheader("📈 Evolução da Média de Check-ins por Hora do Dia")
        evolucao_hora = df_filtrado.groupby(['hora', 'gymName'])['checkins'].mean().reset_index()
        fig_linha = px.line(evolucao_hora, x='hora', y='checkins', color='gymName', markers=True,
                           labels={'hora': 'Hora do Dia', 'checkins': 'Média de Check-ins', 'gymName': 'Unidade'},
                           title="Fluxo Horário por Unidade")
        fig_linha.update_xaxes(dtick=1)
        st.plotly_chart(fig_linha, use_container_width=True)
    with col_direita:
        st.subheader("📅 Volume Total de Acessos por Dia da Semana")
        volume_dia = df_filtrado.groupby(['dia_semana', 'gymName'])['checkins'].sum().reset_index()
        fig_barra = px.bar(volume_dia, x='dia_semana', y='checkins', color='gymName', barmode='group',
                           labels={'dia_semana': 'Dia da Semana', 'checkins': 'Total de Acessos', 'gymName': 'Unidade'},
                           title="Demanda Diária por Unidade")
        st.plotly_chart(fig_barra, use_container_width=True)
    st.divider()
    col_esq2, col_dir2 = st.columns(2)
    with col_esq2:
        st.subheader("📦 Variação de Frequência (Boxplot)")
        fig_box = px.box(df_filtrado, x='gymName', y='checkins', color='gymName',
                         labels={'gymName': 'Unidade', 'checkins': 'Check-ins por Hora'},
                         title="Distribuição e Dispersão de Acessos por Unidade")
        st.plotly_chart(fig_box, use_container_width=True)
    with col_dir2:
        st.subheader("🔥 Mapa de Calor: Ocupação (Dia x Hora)")
        pivot = df_filtrado.pivot_table(values='checkins', index='dia_semana', columns='hora', aggfunc='mean')
        fig_heat = px.imshow(pivot, labels=dict(x="Hora do Dia", y="Dia da Semana", color="Média de Acessos"),
                             x=pivot.columns, y=pivot.index, color_continuous_scale='YlOrRd',
                             aspect="auto", title="Mapa de Calor de Concentração de Público")
        fig_heat.update_xaxes(dtick=1)
        st.plotly_chart(fig_heat, use_container_width=True)
    st.markdown("---")
    st.caption("Desenvolvido para o Projeto Interdisciplinar GymRadar (FATEC - 2026)")
