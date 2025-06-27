"use client";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "next/navigation";

import { getSandboxDetails } from "@/lib/features/trainings/trainingsSlice";
import { SocketProvider, useSocket } from "@/contexts/SocketContext";
import ResultsAndInstructions from "../ResultsAndInstructions/ResultsAndInstructions";
import Playground from "./Playground/Playground";
import TrainingLoading from "../TrainingLoading/TrainingLoading";
import TrainingError from "../TrainingError/TrainingError";
// ** Styles
import classes from "./Training.module.css";

const TrainingContent = ({ sandboxData, activeTab, setActiveTab }) => {
  const { isConnected } = useSocket();

  // Show loading if socket is not connected and we have a valid socketUrl
  const socketUrl =
    sandboxData?.accessUrl && sandboxData?.vmStatus === "running"
      ? sandboxData.accessUrl
      : "";

  if (socketUrl && !isConnected) return <TrainingLoading />;

  return (
    <div className={classes.container}>
      <Playground
        className={classes.editorContainer}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <div className={classes.editorContainer}>
        <ResultsAndInstructions
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>
    </div>
  );
};

const Training = () => {
  const dispatch = useDispatch();
  const params = useParams();
  const trainingId = params.trainingId;

  const { loading, error, sandboxDetails } = useSelector(
    (state) => state.trainings
  );
  const sandboxData = sandboxDetails[trainingId];

  const [activeTab, setActiveTab] = useState("instructions");

  useEffect(() => {
    // Fetch sandbox details if not already available
    if (!error && !loading && trainingId && !sandboxData)
      dispatch(getSandboxDetails(trainingId));
  }, [loading, trainingId, sandboxData]);

  if (loading) return <TrainingLoading />;

  if (error) return <TrainingError errorMessage={error} />;

  // Get the socket URL from sandbox data
  const socketUrl =
    sandboxData?.accessUrl && sandboxData?.vmStatus === "running"
      ? sandboxData.accessUrl
      : "";

  return (
    <SocketProvider url={socketUrl}>
      <TrainingContent
        sandboxData={sandboxData}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </SocketProvider>
  );
};

export default Training;
