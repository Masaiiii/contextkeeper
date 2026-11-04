import { Command } from 'commander';
import Anthropic from '@anthropic-ai/sdk';
import { execSync } from 'child_process';

const program = new Command();
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY, 
});

program
  .name('contextkeeper')
  .description('Automated documentation updates using Claude')
  .version('0.1.0');

program
  .command('check')
  .description('Check uncommitted code diffs against documentation')
  .action(async () => {
    try {
      const diff = execSync('git diff').toString();
      if (!diff) {
        console.log('No code changes detected. Make a change to test.');
        return;
      }

      console.log('Analyzing diff with Claude...');
      
      const msg = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-latest',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: `Analyze this git diff and suggest exactly how the project's README.md or documentation should be updated to reflect these changes:\n\n${diff}`
        }]
      });

      console.log('\nSuggested Documentation Updates:\n');
      console.log(msg.content[0].type === 'text' ? msg.content[0].text : 'No text response.');
    } catch (error) {
      console.error('Error analyzing diff:', error);
    }
  });

program.parse();