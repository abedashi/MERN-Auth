import { useSelector } from "react-redux";

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  return <div>{user ? `Welcome Back ${user.username}` : "Dashboard"}</div>;
};

export default Dashboard;
