import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="not-found-page">
      <h1>404</h1>
      <p>Page not found</p>
      <Link to="/" className="back-home-btn">
        Go back home
      </Link>
    </div>
  );
};

export default NotFoundPage;
