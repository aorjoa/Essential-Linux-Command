// Each diagram describes the selected exercise, without implying it has run.
const guides = [
  {goal:'Make the terminal print your first greeting.',nodes:[['EDIT','scripts/hello.sh','Write an echo command'],['RUN','sh scripts/hello.sh','The shell runs your script'],['RESULT','Hello Ariser!','Read the terminal output']]},
  {goal:'Give your shell script a reusable Make target.',nodes:[['ASK','make hello','Choose a target'],['MAKEFILE','hello recipe','Runs scripts/hello.sh'],['RESULT','Hello Ariser!','Same script, one short command']]},
  {goal:'See how an edited source file becomes a served page.',nodes:[['SOURCE','src/index.html','Edit and save your heading'],['BUILD','make build','Creates dist/index.html'],['PREVIEW','make serve','Serves the built page']]},
  {goal:'Use a failing test to learn what a successful page needs.',nodes:[['CHANGE','src/index.html','Remove the heading'],['CHECK','bun run test','FAIL: heading is missing'],['FIX','Restore the heading','Run the test again → PASS']]},
  {goal:'Automate the checks that must pass before starting the server.',nodes:[['FORMAT','bun run format','Tidy the source'],['TEST','bun run test','A failure stops the recipe'],['START','bun run start','Build and serve after PASS']]}
];
export function workflowGuideMarkup(index) {
  const guide=guides[index];
  return `<p class="work-learning-goal">${guide.goal}</p><ol class="work-diagram" aria-label="How this exercise works">${guide.nodes.map(([label,title,detail],i)=>`<li><span class="work-diagram-step">${i+1} · ${label}</span><strong>${title}</strong><small>${detail}</small></li>`).join('')}</ol>`;
}
