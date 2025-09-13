
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import ErrorBoundary from "./components/ErrorBoundary";

const App = () => {
  console.log('App component rendering...');
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
};

export default App;
