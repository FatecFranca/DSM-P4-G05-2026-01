import "../styles/base.css";
import "./Contact.css";

function Dashboard() {
  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>
      <form>
        <label>
          Name:
          <input type="text" name="name" />
        </label>
        <label>
          Email:
          <input type="email" name="email" />
        </label>
        <label>
          Message:
          <textarea name="message"></textarea>
        </label>
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default Dashboard;