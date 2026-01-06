import React, { useState } from "react";
import axios, { isAxiosError } from "axios";

interface User {
  id: number;
  name: string;
  email: string;
  company: {
    name: string;
  };
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleFetch = async () => {
    setLoading(true);
    setError("");
    setUser(null);

    try {
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/users/1"
      );

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      setUser(data);
    } catch (error) {
      // const v =1
      if (error instanceof TypeError) {
        console.error("Network error:", error.message);
      } else {
        console.error("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAxios = async () => {
    setLoading(true);
    setError("");
    setUser(null);

    try {
      const response = await axios.get(
        "https://jsonplaceholder.typicode.com/users/2"
      );
      setUser(response.data);
    } catch (error) {
      if (isAxiosError(error)) {
        // TypeScript now knows 'error' is an AxiosError
        console.log(error.response?.data);
        console.log(error.response?.status);
        console.log(error.code);
        if (error.response?.status === 404){

          setError("หาไม่เจอ")
        }

      } else if(error instanceof TypeError) {
        
        console.error("An unexpected error occurred:", error.message);
        setError(`Axios Error: ${error.message}`);
        
      }
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          API Fetching Demo
        </h1>

        
        <div className="flex gap-4 mb-6">
          <button
            onClick={handleFetch}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition"
          >
            ใช้ Fetch (User 1)
          </button>
          <button
            onClick={handleAxios}
            className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded transition"
          >
            ใช้ Axios (User 2)
          </button>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 min-h-37.5">
          {loading && (
            <div className="text-center text-gray-500 py-4">
              กำลังโหลดข้อมูล...
            </div>
          )}

          {error && (
            <div className="text-red-500 text-center py-4">{error}</div>
          )}

          {user && !loading && (
            <div className="space-y-2 animate-fade-in">
              <h2 className="text-lg font-bold text-gray-700 border-b pb-2 mb-2">
                User Details
              </h2>
              <p>
                <span className="font-semibold">ID:</span> {user.id}
              </p>
              <p>
                <span className="font-semibold">Name:</span> {user.name}
              </p>
              <p>
                <span className="font-semibold">Email:</span> {user.email}
              </p>
              <p>
                <span className="font-semibold">Company:</span>{" "}
                {user.company.name}
              </p>
            </div>
          )}

          {!user && !loading && !error && (
            <div className="text-center text-gray-400 py-8 text-sm">
              กดปุ่มด้านบนเพื่อดึงข้อมูล
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
