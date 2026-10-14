"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ActionIcon, Alert, Button, Group, Tabs, Text, Tooltip } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconArrowLeft, IconPlugConnectedX, IconTrophy } from "@tabler/icons-react";

import api, { errorMessage } from "@/lib/api";
import { achievementIcon } from "@/lib/achievementIcons";
import { SocketProvider, useSocket } from "@/contexts/SocketContext";
import useTrainingDetail from "./useTrainingDetail";
import useSandbox from "./useSandbox";
import { applyCompletion, flattenInstructions, initialInstructionId } from "./curriculum";
import InstructionsPanel from "./InstructionsPanel";
import Playground from "./Playground";
import Results from "./Results";
import { WorkspaceError, WorkspaceLoading } from "./WorkspaceStatus";
import classes from "./Workspace.module.css";

// xterm needs the browser.
const Terminal = dynamic(() => import("./Terminal"), { ssr: false });

// The sandbox stops programs after 15 s; give up waiting a little later.
const RUN_RESULT_TIMEOUT_MS = 30000;

/** Runs files on the sandbox and keeps the last result. */
const useRunner = () => {
  const { socket } = useSocket();
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);
  const pending = useRef(null);
  const timer = useRef(null);

  const finish = useCallback((data) => {
    clearTimeout(timer.current);
    const { file, startedAt } = pending.current || {};
    pending.current = null;
    setResult({ data, file, durationMs: startedAt ? Date.now() - startedAt : undefined });
    setRunning(false);
  }, []);

  // A result lost with the connection used to leave the run button spinning
  // (and disabled) until the page was reloaded.
  useEffect(() => {
    if (!socket) return;
    const onResult = (data) => {
      if (pending.current) finish(data);
    };
    const onDisconnect = () => {
      if (pending.current)
        finish({ error: true, message: "Bağlantı koptuğu için sonuç alınamadı. Bağlantı gelince tekrar çalıştırın." });
    };
    socket.on("result", onResult);
    socket.on("disconnect", onDisconnect);
    return () => {
      socket.off("result", onResult);
      socket.off("disconnect", onDisconnect);
      clearTimeout(timer.current);
      pending.current = null;
      setRunning(false);
    };
  }, [socket, finish]);

  const run = useCallback(
    (path) => {
      if (!socket) return;
      pending.current = { file: path.replace(/^\//, ""), startedAt: Date.now() };
      setRunning(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(
        () => finish({ error: true, message: "Sanal makine zamanında yanıt vermedi. Tekrar deneyin." }),
        RUN_RESULT_TIMEOUT_MS
      );
      socket.emit("run:file", { path });
    },
    [socket, finish]
  );

  return { result, running, run };
};

const notifyCompletion = (completion) => {
  for (const achievement of completion.newAchievements || []) {
    const Icon = achievementIcon(achievement.icon);
    notifications.show({
      color: "yellow",
      icon: <Icon size={18} />,
      title: `Başarı kazandınız: ${achievement.name}`,
      message: achievement.description,
      autoClose: 6000,
    });
  }

  if (completion.trainingCompleted)
    notifications.show({
      color: "teal",
      icon: <IconTrophy size={18} />,
      title: "Tebrikler, eğitimi tamamladınız! 🎉",
      message: "Tüm adımları bitirdiniz. İstatistikler sayfasından ilerlemenizi görebilirsiniz.",
      autoClose: 8000,
    });
  else if (completion.chapterCompleted)
    notifications.show({ color: "teal", title: "Bölüm tamamlandı", message: "Harika gidiyorsunuz!" });
};

const WorkspaceContent = ({ training, setTraining, sandboxAvailable, sandboxNotice, onRecreate }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isConnected, connectError, reconnect } = useSocket();
  const { result, running, run } = useRunner();
  const [tab, setTab] = useState("instructions");
  const [completing, setCompleting] = useState(false);
  const [currentId, setCurrentId] = useState(() =>
    initialInstructionId(training, searchParams.get("adim"))
  );
  const hasConnected = useRef(false);
  if (isConnected) hasConnected.current = true;

  const selectInstruction = useCallback(
    (id) => {
      setCurrentId(id);
      router.replace(`?adim=${encodeURIComponent(id)}`, { scroll: false });
    },
    [router]
  );

  const toggleComplete = async (step, completed) => {
    setCompleting(true);
    try {
      const { data } = completed
        ? await api.post(`/instructions/${step.id}/complete`)
        : await api.delete(`/instructions/${step.id}/complete`);
      const { completion } = data;

      setTraining((current) => applyCompletion(current, step.id, completed, completion.progress));

      if (completed) {
        notifyCompletion(completion);
        // Move on to the next step.
        const steps = flattenInstructions(training);
        const next = steps[steps.findIndex((s) => s.id === step.id) + 1];
        if (next) selectInstruction(next.id);
      }
    } catch (error) {
      notifications.show({ color: "red", title: "İlerleme kaydedilemedi", message: errorMessage(error) });
    } finally {
      setCompleting(false);
    }
  };

  const handleRun = useCallback(
    (path) => {
      setTab("results");
      run(path);
    },
    [run]
  );

  if (sandboxAvailable && connectError)
    return (
      <WorkspaceError title="Sanal makineye bağlanılamadı" message={`${connectError} Makine yeniden başlatılıyor olabilir.`}>
        <Button variant="default" onClick={reconnect}>
          Tekrar bağlan
        </Button>
        <Button onClick={onRecreate}>Ortamı yeniden oluştur</Button>
      </WorkspaceError>
    );

  if (sandboxAvailable && !hasConnected.current)
    return <WorkspaceLoading title="Sanal makinenize bağlanılıyor" description="Neredeyse hazır…" />;

  const instructions = (
    <InstructionsPanel
      training={training}
      currentId={currentId}
      onSelect={selectInstruction}
      onToggleComplete={toggleComplete}
      completing={completing}
    />
  );

  return (
    <div className={classes.workspace}>
      <header className={classes.header}>
        <Group gap="xs" wrap="nowrap">
          <Tooltip label="Eğitimlere dön">
            <ActionIcon component={Link} href="/egitimler" variant="subtle" color="gray" aria-label="Eğitimlere dön">
              <IconArrowLeft size={18} />
            </ActionIcon>
          </Tooltip>
          <Text fw={600} c="white" truncate>
            {training.name}
          </Text>
        </Group>
        {sandboxAvailable && !isConnected ? (
          <Group gap={6} c="yellow.4">
            <IconPlugConnectedX size={16} />
            <Text size="sm">Bağlantı koptu, yeniden bağlanılıyor…</Text>
          </Group>
        ) : null}
      </header>

      {sandboxAvailable ? (
        <div className={classes.body}>
          <div className={classes.editorPane}>
            <Playground onRun={handleRun} running={running} />
          </div>
          <Tabs value={tab} onChange={setTab} keepMounted className={classes.sidePane} classNames={{ list: classes.tabsList, panel: classes.tabPanel, tab: classes.tab }}>
            <Tabs.List>
              <Tabs.Tab value="instructions">Yönergeler</Tabs.Tab>
              <Tabs.Tab value="results">Çıktılar</Tabs.Tab>
              <Tabs.Tab value="terminal">Terminal</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="instructions">{instructions}</Tabs.Panel>
            <Tabs.Panel value="results">
              <Results result={result} running={running} />
            </Tabs.Panel>
            <Tabs.Panel value="terminal">
              <Terminal active={tab === "terminal"} />
            </Tabs.Panel>
          </Tabs>
        </div>
      ) : (
        <div className={classes.instructionsOnly}>
          {sandboxNotice ? (
            <Alert color="red" m="md" title="Sanal makine hazırlanamadı" role="alert">
              <Text size="sm">
                {sandboxNotice.message} Yönergeleri okumaya ve ilerlemenizi kaydetmeye devam edebilirsiniz.
              </Text>
              <Button size="xs" mt="sm" onClick={sandboxNotice.onRetry}>
                Yeniden oluştur
              </Button>
            </Alert>
          ) : (
            <Alert color="yellow" m="md" title="Sanal laboratuvar şu anda kullanılamıyor">
              Yönergeleri okuyup ilerlemenizi kaydedebilirsiniz; kod çalıştırma özelliği daha sonra açılacak.
            </Alert>
          )}
          {instructions}
        </div>
      )}
    </div>
  );
};

const NotEnrolled = ({ training, onEnrolled }) => {
  const [loading, setLoading] = useState(false);

  const enroll = async () => {
    setLoading(true);
    try {
      await api.post(`/trainings/${training.id}/enroll`);
    } catch (error) {
      if (error?.response?.status !== 409) {
        setLoading(false);
        notifications.show({ color: "red", title: "Kayıt olunamadı", message: errorMessage(error) });
        return;
      }
    }
    onEnrolled();
  };

  return (
    <WorkspaceError title={training.name} message="Bu eğitimin çalışma alanını açmak için önce kayıt olun.">
      <Button onClick={enroll} loading={loading}>
        Eğitime başla
      </Button>
    </WorkspaceError>
  );
};

const Workspace = () => {
  const { trainingId } = useParams();
  const { training, setTraining, loading, error, reload } = useTrainingDetail(trainingId);
  const sandbox = useSandbox(trainingId, { enabled: Boolean(training?.isEnrolled) });

  if (loading && !training) return <WorkspaceLoading title="Eğitim yükleniyor" />;

  if (error)
    return (
      <WorkspaceError message={error}>
        <Button onClick={reload}>Tekrar dene</Button>
      </WorkspaceError>
    );

  if (!training.isEnrolled) return <NotEnrolled training={training} onEnrolled={reload} />;

  switch (sandbox.state) {
    case "loading":
      return <WorkspaceLoading title="Eğitim ortamınız hazırlanıyor" />;
    case "creating":
      return (
        <WorkspaceLoading
          title="Sanal makineniz oluşturuluyor"
          description="İlk açılışta bu işlem bir dakika kadar sürebilir. Sayfadan ayrılabilirsiniz; hazırlık arka planda devam eder."
        />
      );
    default:
      break;
  }

  const running = sandbox.state === "running";

  return (
    <SocketProvider url={running ? sandbox.sandbox.accessUrl : null} token={sandbox.sandbox?.accessToken}>
      <WorkspaceContent
        training={training}
        setTraining={setTraining}
        sandboxAvailable={running}
        // The lesson stays readable when the VM could not be prepared.
        sandboxNotice={
          sandbox.state === "error" ? { message: sandbox.error || "Bilinmeyen hata.", onRetry: sandbox.retry } : null
        }
        onRecreate={sandbox.recreate}
      />
    </SocketProvider>
  );
};

export default Workspace;
