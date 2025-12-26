import { GithubIntegration } from '@mastra/github';

export const github = new GithubIntegration({
  config: {
    PERSONAL_ACCESS_TOKEN: process.env.GITHUB_PAT!,
  },
});
