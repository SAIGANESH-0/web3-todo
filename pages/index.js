import { useEffect, useState } from "react";
import Web3 from "web3";
import abi from "../public/TodoList.json";

const contractAddress = "0x71612F400F64A27638D6B42563b5027Af354711A";

// replace with your contract address

export default function Home() {
  const [web3, setWeb3] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [contract, setContract] = useState(null);
  const [taskDescription, setTaskDescription] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [num, setnum] = useState(0);
  // Connect to MetaMask and fetch tasks on page load

  useEffect(() => {
    async function connectToMetaMask() {
      if (typeof window.ethereum !== "undefined") {
        const web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await web3.eth.getAccounts();
        const selectedAddress = accounts[0];

        setWeb3(web3);
        setSelectedAddress(selectedAddress);

        const contract = new web3.eth.Contract(abi.abi, contractAddress);
        setContract(contract);
        setLoading(true);
        let tasks = await contract.methods.getTasks().call();
        tasks = tasks.filter((x, ind) => ind > 11);
        setTasks(tasks);
        setnum(tasks.length);
        setLoading(false);
      } else {
        console.log("MetaMask not detected");
      }
    }

    connectToMetaMask();
  }, []);

  // Handle form submit to create a new task

  async function handleSubmit(event) {
    event.preventDefault();

    if (!contract || !selectedAddress || !taskDescription) {
      console.log("Not connected to MetaMask or missing input data");

      return;
    }
    setLoading(true);
    await contract.methods
      .createTask(taskDescription)
      .send({ from: selectedAddress });
    console.log("Task created!");

    let tasks = await contract.methods.getTasks().call();
    tasks = tasks.filter((x, ind) => ind > 11);
    setTasks(tasks);
    setnum(tasks.length);
    setTaskDescription("");
    setLoading(false);
  }

  const toggleCompleted = async (taskId) => {
    setLoading(true);
    try {
      await contract.methods
        .toggleTaskCompleted(taskId + 12)
        .send({ from: selectedAddress });

      let tasksU = await contract.methods.getTasks().call();
      tasksU = tasksU.filter((x, ind) => ind > 11);
      setTasks(tasksU);
      setnum(tasksU.length);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  // Render the form, connected address, and task list
  return (
    <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <header className="py-4">
        <h1 className="text-white text-3xl font-bold text-center">
          WEB3 TO DO APP
        </h1>
        <h2 className="text-white text-2xl mt-2 font-bold text-center">
          Please use Sepolia Testnet
        </h2>
      </header>
      {selectedAddress ? (
        <p className="text-xl text-white font-semibold mt-8 mb-8">
          Connected to MetaMask with address : {selectedAddress}
        </p>
      ) : (
        <button
          onClick={() =>
            window.ethereum.request({ method: "eth_requestAccounts" })
          }
          className="bg-white text-center text-indigo-500 mt-8 font-semibold py-2 px-4 rounded-full hover:bg-indigo-500 hover:text-white transition-colors duration-300 ease-in-out mb-8"
        >
          Connect to MetaMask
        </button>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row  mb-8">
        <input
          type="text"
          placeholder="Enter task description ...."
          value={taskDescription}
          onChange={(event) => setTaskDescription(event.target.value)}
          className="border border-gray-300 rounded-l-lg px-4 py-2  sm:w-3/4 mb-2 sm:mb-0"
        />
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-600 rounded-r-lg px-4 py-2 text-white font-medium transition-colors duration-300 ease-in-out"
        >
          Add Task
        </button>
      </form>

      <h2 className="text-2xl text-white font-bold mb-4">Tasks ({num}) : </h2>
      {loading ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="animate-spin h-32 w-32 m-auto absolute top-0 bottom-0 left-0 right-0"
          style={{ zIndex: 9999 }}
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        <ul className="divide-y divide-gray-300 mt-4">
          {tasks.map((task, index) => (
            <li key={index} className="py-2">
              <div className="flex items-center justify-between">
                <span className="flex-grow">{task[0]}</span>
                <button
                  className={`rounded-full w-6 h-6 ${
                    task[1] ? "bg-green-500" : "bg-gray-400"
                  }`}
                  onClick={() => toggleCompleted(index)}
                >
                  {task[1] ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mx-auto text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M17.707 5.293a1 1 0 00-1.414 0L8 13.586 4.707 10.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l10-10a1 1 0 000-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mx-auto text-gray-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M17.707 5.293a1 1 0 00-1.414 0L8 13.586 4.707 10.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l10-10a1 1 0 000-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
