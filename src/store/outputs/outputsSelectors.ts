import { createSelector } from '@reduxjs/toolkit';
import { type RootState } from 'store/store';
import { OutputFilters, OutputRating, type OutputType } from './outputsSlice';
import { isRegexp } from 'utils';

const selectOutputs = (state: RootState): Record<string, OutputType[]> =>
  state.outputs.outputs;

const selectFilters = (state: RootState): Record<string, OutputFilters> =>
  state.outputs.filters;

export const selectOutputsByChainId = (
  chainId: string | undefined
): ((state: RootState) => OutputType[]) =>
  createSelector([selectOutputs], (outputs: Record<string, OutputType[]>) => {
    if (chainId) {
      return outputs[chainId] || [];
    }
    return [];
  });

export const selectFilteredOutputsByChainId = (
  chainId: string | undefined
): ((state: RootState) => OutputType[]) =>
  createSelector(
    [selectOutputs, selectFilters],
    (
      outputs: Record<string, OutputType[]>,
      filters: Record<string, OutputFilters>
    ) => {
      if (!chainId) {
        return [];
      }

      const chainOutputs = outputs[chainId] || [];
      const filter = filters[chainId];

      if (!filter) {
        return chainOutputs;
      }

      const { model, rating, search } = filter;

      const checkedModels = model
        .filter((item) => item.checked)
        .map((item) => item.name);
      const activeRatings = rating
        .filter((item) => item.checked)
        .map((item) => item.name);

      return chainOutputs.filter((output) => {
        const matchesModel =
          checkedModels.length === 0 ||
          checkedModels.includes(output.ModelType);

        let outputRating = OutputRating.Neutral;
        if (output.Like) {
          outputRating = OutputRating.Nice;
        } else if (output.Dislike) {
          outputRating = OutputRating.Dislike;
        }

        const matchesRating =
          activeRatings.length === 0 || activeRatings.includes(outputRating);

        const matchesSearch =
          !search ||
          output.Completions.some((completion) => {
            const content = completion.Content?.toLowerCase() ?? '';

            const isMatch = content.includes(search.toLowerCase());

            if (!isMatch) {
              if (isRegexp(search)) {
                const regex = new RegExp(search, 'i');
                return content.match(regex);
              }
            }

            return isMatch;
          });

        return matchesModel && matchesRating && matchesSearch;
      });
    }
  );

export const selectOutputFiltersByChainId = (
  chainId: string | undefined
): ((state: RootState) => OutputFilters | null) =>
  createSelector([selectFilters], (filters: Record<string, OutputFilters>) => {
    if (chainId) {
      return filters[chainId] || null;
    }
    return null;
  });
