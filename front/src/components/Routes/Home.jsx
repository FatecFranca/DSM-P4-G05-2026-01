import { useEffect } from "react";
import "./Home.css";
import Dashboard from "../Dashboard";
import InputGym from "../inputGym";
import Inputs from "../inputsClient";
import Footer from "../Hours";


function Home({ gyms = [], onRefreshGyms, user = "" }) {
    useEffect(() => {
        onRefreshGyms?.();
    }, [onRefreshGyms]);

    const handleGymRemoved = (id) => {

        onRefreshGyms?.();
    };

    return (
        <div className="home-page">
            <section className="hero">
                <div className="hero-content">
                    <h1 className="hero-title">Push Your <span style={{ color: "var(--primary-color)" }}>Limits</span></h1>
                    <p className="hero-subtitle">Transform your body and mind</p>
                </div>
            </section>

            <section className="home-columns">

                <div>
                    <h2 style={{ marginBottom: 8 }}>Gym Dashboard</h2>
                    <Dashboard gyms={gyms} onGymRemoved={handleGymRemoved} />
                </div>
                <div className="inputsHome">
                    <div className="panel">
                        <InputGym onGymAdded={onRefreshGyms} />
                    </div>

                    <div className="panel2">
                        <text>Dont forget to check the best hours for your gym!</text>
                    </div>

                    <div className="panel">
                        <Inputs onClientAdded={onRefreshGyms} onClientDeleted={onRefreshGyms} username={user} />
                    </div>
                </div>

                <Footer gym={user} />
            </section>
        </div>
    );
}

export default Home;