import { RouterProvider } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";

// styles
import "./App.css";
import router from "./routes";

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <TooltipProvider>
        <RouterProvider router={router} />
      </TooltipProvider>
    </>
  );
}

export default App;