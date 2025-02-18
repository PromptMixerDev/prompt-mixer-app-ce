import { v4 as uuidv4 } from 'uuid';
import {
  addAIToolToChain,
  deleteAIToolFromChain,
  IDBWrapper,
  updateAIToolInChain,
} from 'db/workspaceDb';
import { AppDispatch } from 'store/store';
import {
  addAITool,
  deleteAITool,
  updateAITool,
} from 'store/aiTools/aiToolsSlice';
import { IAITool } from './AITools';

export const handleAIToolAdd = (
  db: IDBWrapper,
  aiTools: IAITool[],
  dispatch: AppDispatch,
  tabId: string,
  chainId?: string
): void => {
  const newAITool = {
    AIToolID: uuidv4(),
    ChainID: chainId ?? tabId,
    Name: `Tool ${aiTools.length + 1}`,
  };

  if (chainId) {
    addAIToolToChain(db, newAITool).catch((error) => {
      console.error(error);
    });
  }

  dispatch(addAITool({ chainId: chainId ?? tabId, aiTool: newAITool }));
};

export const handleAIToolUpdate = (
  db: IDBWrapper,
  newValue: string,
  aiTool: IAITool,
  dispatch: AppDispatch,
  tabId: string,
  chainId?: string
): void => {
  const updatedAITool = { ...aiTool, Value: newValue };

  if (chainId) {
    updateAIToolInChain(db, updatedAITool).catch((error) => {
      console.error(error);
    });
  }

  dispatch(updateAITool({ chainId: chainId ?? tabId, aiTool: updatedAITool }));
};

export const handleAIToolDelete = (
  db: IDBWrapper,
  aiTool: IAITool,
  dispatch: AppDispatch,
  tabId: string,
  chainId?: string
): void => {
  if (chainId) {
    deleteAIToolFromChain(db, aiTool).catch((error) => {
      console.error(error);
    });
  }

  dispatch(deleteAITool({ chainId: chainId ?? tabId, aiTool }));
};

export const validateJSON = (value: string): string | null => {
  try {
    if (value) {
      JSON.parse(value);
    }
    return null;
  } catch (error) {
    console.error(error);
    return 'Invalid JSON';
  }
};
