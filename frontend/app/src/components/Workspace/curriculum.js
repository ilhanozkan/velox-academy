// Helpers over a training's curriculum (chapters → instructions).

export const flattenInstructions = (training) =>
  (training?.chapters || []).flatMap((chapter) =>
    chapter.instructions.map((instruction) => ({ ...instruction, chapter }))
  );

/** The step to open: the requested one, else the first unfinished one. */
export const initialInstructionId = (training, requestedId) => {
  const steps = flattenInstructions(training);
  if (requestedId && steps.some((step) => step.id === requestedId)) return requestedId;
  return (steps.find((step) => !step.completed) || steps[0])?.id || null;
};

/** Applies a completion response to the training state. */
export const applyCompletion = (training, instructionId, completed, progress) => ({
  ...training,
  progress,
  chapters: training.chapters.map((chapter) => {
    const instructions = chapter.instructions.map((instruction) =>
      instruction.id === instructionId ? { ...instruction, completed } : instruction
    );
    const done = instructions.filter((i) => i.completed).length;
    return {
      ...chapter,
      instructions,
      completed: instructions.length > 0 && done === instructions.length,
      progress: {
        completedInstructions: done,
        totalInstructions: instructions.length,
        percent: instructions.length ? Math.round((done / instructions.length) * 100) : 0,
      },
    };
  }),
});
