type PhaseActions = { [key: string]: unknown };

const phaseActionsByController = new WeakMap<object, PhaseActions>();

export function getWorkbenchLibraryPhaseActions(controllerKey: object) {
  let actions = phaseActionsByController.get(controllerKey);
  if (!actions) {
    actions = {};
    phaseActionsByController.set(controllerKey, actions);
  }
  return actions;
}

export function registerWorkbenchLibraryPhaseActions(controllerKey: object, actions: PhaseActions) {
  Object.assign(getWorkbenchLibraryPhaseActions(controllerKey), actions);
}
