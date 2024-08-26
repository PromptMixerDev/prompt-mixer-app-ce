import { configureStore } from '@reduxjs/toolkit';
import datasetReducer, { resetDatasetState } from './dataset/datasetSlice';
import treeReducer, { resetTreeState } from './tree/treeSlice';
import modelReducer, { resetModelState } from './model/modelSlice';
import outputsReducer, { resetOutputState } from './outputs/outputsSlice';
import workflowOutputsReducer, {
  resetWorkflowOutputsState,
} from './workflowOutputs/workflowOutputsSlice';
import connectorsReducer, {
  resetConnectorsState,
} from './connectors/connectorsSlice';
import workspaceReducer from './workspace/workspaceSlice';
import promptsReducer, { resetPromptsState } from './prompts/promptsSlice';
import workflowReducer, { resetWorkflowState } from './workflow/workflowSlice';
import variablesReducer, {
  resetVariablesState,
} from './variables/variablesSlice';
import selectedEntityReducer, {
  resetSelectedEntityState,
} from './selectedEntity/selectedEntitySlice';
import flexLayoutModelReducer from './flexLayoutModel/flexLayoutModelSlice';
import { serializeDateMiddleware } from './middlewares';

export const store = configureStore({
  reducer: {
    tree: treeReducer,
    model: modelReducer,
    outputs: outputsReducer,
    workflowOutputs: workflowOutputsReducer,
    connectors: connectorsReducer,
    dataset: datasetReducer,
    workspace: workspaceReducer,
    prompts: promptsReducer,
    variables: variablesReducer,
    workflow: workflowReducer,
    selectedEntity: selectedEntityReducer,
    flexLayoutModel: flexLayoutModelReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['flexLayoutModel/setModel'],
        ignoredPaths: ['flexLayoutModel.model'],
      },
    }).prepend(serializeDateMiddleware),
});

export const resetStore = (): void => {
  store.dispatch(resetConnectorsState());
  store.dispatch(resetDatasetState());
  store.dispatch(resetModelState());
  store.dispatch(resetOutputState());
  store.dispatch(resetPromptsState());
  store.dispatch(resetTreeState());
  store.dispatch(resetVariablesState());
  store.dispatch(resetWorkflowState());
  store.dispatch(resetSelectedEntityState());
  store.dispatch(resetWorkflowOutputsState());
};

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
