"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ActionIcon,
  Alert,
  Button,
  Group,
  Loader,
  Menu,
  Progress,
  Tabs,
  Text,
  Tooltip,
  VisuallyHidden,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import {
  IconArrowLeft,
  IconBook2,
  IconCode,
  IconDotsVertical,
  IconListDetails,
  IconRefresh,
  IconRestore,
  IconTerminal2,
  IconTrophy,
} from "@tabler/icons-react";

import api, { errorMessage } from "@/lib/api";
import { achievementIcon } from "@/lib/achievementIcons";
import { SocketProvider, useSocket } from "@/contexts/SocketContext";
import useStoredState from "@/hooks/useStoredState";
import useTrainingDetail from "./useTrainingDetail";
import useSandbox from "./useSandbox";
import { applyCompletion, flattenInstructions, initialInstructionId } from "./curriculum";
import InstructionsPanel from "./InstructionsPanel";
import Playground from "./Playground";
import Results from "./Results";
import Splitter from "./Splitter";
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

const SIDE_RATIO = { default: 0.45, min: 0.25, max: 0.7, step: 0.02 };
const clampRatio = (ratio) => Math.min(SIDE_RATIO.max, Math.max(SIDE_RATIO.min, ratio));

const MOBILE_VIEWS = [
  { value: "instructions", label: "Yönergeler", icon: IconBook2 },
  { value: "code", label: "Kod", icon: IconCode },
  { value: "results", label: "Çıktılar", icon: IconListDetails },
  { value: "terminal", label: "Terminal", icon: IconTerminal2 },
];

const ConnectionStatus = ({ connected }) => (
  <span className={classes.connection} data-connected={connected || undefined} role="status">
    <span className={classes.connectionDot} aria-hidden />
    {connected ? "Bağlı" : "Yeniden bağlanıyor…"}
  </span>
);

/** Screen reader announcement for runs. */
const runAnnouncement = (running, result) => {
  if (running) return "Dosya çalıştırılıyor.";
  if (!result) return "";
  const { data } = result;
  if (data && typeof data === "object" && !Array.isArray(data) && (data.error || data.message))
    return "Çalıştırma hatayla sonuçlandı. Ayrıntılar Çıktılar sekmesinde.";
  if (Array.isArray(data)) return `Sorgu ${data.length} satır döndürdü.`;
  return "Çalıştırma tamamlandı.";
};

const WorkspaceContent = ({ training, setTraining, sandboxAvailable, sandboxNotice, onRecreate }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isConnected, connectError, reconnect } = useSocket();
  const { result, running, run } = useRunner();
  const [tab, setTab] = useState("instructions");
  // Small screens show one pane at a time; this selects the editor.
  const [showCode, setShowCode] = useState(false);
  const [sideRatio, setSideRatio] = useStoredState("velox.workspace.sideRatio", SIDE_RATIO.default);
  const bodyRef = useRef(null);
  const [completing, setCompleting] = useState(false);
  const [currentId, setCurrentId] = useState(() =>
    initialInstructionId(training, searchParams.get("adim"))
  );
  const hasConnected = useRef(false);
  if (isConnected) hasConnected.current = true;

  const steps = useMemo(() => flattenInstructions(training), [training]);
  const stepIndex = steps.findIndex((step) => step.id === currentId);

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
      setShowCode(false);
      run(path);
    },
    [run]
  );

  const selectMobileView = (view) => {
    setShowCode(view === "code");
    if (view !== "code") setTab(view);
  };

  const confirmRecreate = () =>
    modals.openConfirmModal({
      title: "Ortam sıfırlansın mı?",
      children: (
        <Text size="sm">
          Sanal makineniz silinip baştan oluşturulur. Çalışma alanındaki dosyalarda yaptığınız değişiklikler
          kaybolur; eğitimdeki ilerlemeniz korunur.
        </Text>
      ),
      labels: { confirm: "Sıfırla", cancel: "Vazgeç" },
      confirmProps: { color: "red" },
      onConfirm: onRecreate,
    });

  const resizeSide = (clientX) => {
    const rect = bodyRef.current?.getBoundingClientRect();
    if (rect?.width) setSideRatio(clampRatio((rect.right - clientX) / rect.width));
  };

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

  const { percent } = training.progress;
  const mobileView = showCode ? "code" : tab;

  return (
    <div className={classes.workspace}>
      <header className={classes.header}>
        <Group gap="xs" wrap="nowrap" miw={0}>
          <Tooltip label="Eğitimlere dön">
            <ActionIcon
              component={Link}
              href="/egitimler"
              variant="subtle"
              color="gray"
              className={classes.headerIcon}
              aria-label="Eğitimlere dön"
            >
              <IconArrowLeft size={18} />
            </ActionIcon>
          </Tooltip>
          <div className={classes.title}>
            <Text component="h1" fw={600} c="white" truncate fz="sm" lh={1.3}>
              {training.name}
            </Text>
            {stepIndex >= 0 ? (
              <Text fz="xs" c="navy.2" truncate lh={1.3}>
                Adım {stepIndex + 1} / {steps.length} · {steps[stepIndex].name}
              </Text>
            ) : null}
          </div>
        </Group>

        <Group gap="md" wrap="nowrap">
          <Group gap={8} wrap="nowrap" visibleFrom="sm">
            <Progress
              value={percent}
              w={110}
              size="sm"
              color={percent === 100 ? "teal.5" : "primary.3"}
              className={classes.headerProgress}
              aria-label="Eğitim ilerlemesi"
            />
            <Text fz="xs" fw={600} c="white">
              %{percent}
            </Text>
          </Group>

          {sandboxAvailable ? <ConnectionStatus connected={isConnected} /> : null}

          {sandboxAvailable ? (
            <Menu position="bottom-end" withinPortal>
              <Menu.Target>
                <ActionIcon variant="subtle" color="gray" className={classes.headerIcon} aria-label="Çalışma alanı menüsü">
                  <IconDotsVertical size={18} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item leftSection={<IconRefresh size={16} />} onClick={reconnect}>
                  Yeniden bağlan
                </Menu.Item>
                <Menu.Item color="red" leftSection={<IconRestore size={16} />} onClick={confirmRecreate}>
                  Ortamı sıfırla
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          ) : null}
        </Group>
      </header>

      {sandboxAvailable ? (
        <>
          <div
            className={classes.body}
            ref={bodyRef}
            data-view={mobileView}
            style={{ "--side-size": `${(sideRatio * 100).toFixed(2)}%` }}
          >
            <div className={classes.editorPane}>
              <Playground onRun={handleRun} running={running} />
            </div>
            <Splitter
              className={classes.sideSplitter}
              label="Yönerge panelinin genişliği"
              value={sideRatio * 100}
              min={SIDE_RATIO.min * 100}
              max={SIDE_RATIO.max * 100}
              onDrag={resizeSide}
              // Moving the handle left makes the side pane wider.
              onStep={(direction) => setSideRatio((ratio) => clampRatio(ratio - direction * SIDE_RATIO.step))}
              onReset={() => setSideRatio(SIDE_RATIO.default)}
            />
            <Tabs
              value={tab}
              onChange={setTab}
              keepMounted
              className={classes.sidePane}
              classNames={{ list: classes.tabsList, panel: classes.tabPanel, tab: classes.tab }}
            >
              <Tabs.List>
                <Tabs.Tab value="instructions" leftSection={<IconBook2 size={15} />}>
                  Yönergeler
                </Tabs.Tab>
                <Tabs.Tab value="results" leftSection={<IconListDetails size={15} />}>
                  Çıktılar
                </Tabs.Tab>
                <Tabs.Tab value="terminal" leftSection={<IconTerminal2 size={15} />}>
                  Terminal
                </Tabs.Tab>
              </Tabs.List>
              <Tabs.Panel value="instructions">{instructions}</Tabs.Panel>
              <Tabs.Panel value="results">
                <Results result={result} running={running} />
              </Tabs.Panel>
              <Tabs.Panel value="terminal">
                <Terminal active={tab === "terminal" && !showCode} />
              </Tabs.Panel>
            </Tabs>
          </div>

          <nav className={classes.mobileNav} aria-label="Çalışma alanı bölümleri">
            {MOBILE_VIEWS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                className={classes.mobileNavItem}
                data-active={mobileView === value || undefined}
                aria-pressed={mobileView === value}
                onClick={() => selectMobileView(value)}
              >
                <Icon size={20} aria-hidden />
                <span>{label}</span>
                {value === "results" && running ? <Loader size={10} color="primary.4" className={classes.mobileNavBusy} /> : null}
              </button>
            ))}
          </nav>

          <VisuallyHidden role="status" aria-live="polite">
            {runAnnouncement(running, result)}
          </VisuallyHidden>
        </>
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
