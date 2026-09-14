const slides = [
  {
    topic: 'Why Make?', title: 'A shared way to run project tasks',
    body: `<p>A Makefile gives repeated commands short, memorable names. Everyone can run the same build or test steps from the project folder.</p><ul><li><strong>Reuse commands:</strong> write a recipe once, then run its target.</li><li><strong>Track dependencies:</strong> rebuild an output when an input changes.</li><li><strong>Skip unchanged work:</strong> keep an existing output when it is up to date.</li></ul>`,
    example: `<div class="make-code-label">Makefile</div><pre><code>.PHONY: test
test:
\tbun scripts/check.js</code></pre><div class="make-code-label">Terminal</div><pre><code>make test</code></pre><div class="make-role-map" aria-label="Make delegates execution to Bun"><div><span>YOU ASK</span><strong>make test</strong><small>Choose a named task</small></div><div><span>MAKE READS</span><strong>Makefile</strong><small>Find the test recipe</small></div><div><span>BUN RUNS</span><strong>check.js</strong><small>Report PASS or FAIL</small></div></div><p class="make-caption">Make organizes the tasks. The shell executes recipes. Bun runs this project’s JavaScript.</p>`
  },
  {
    topic: 'Read a rule', title: 'Read a Make rule',
    body: `<p class="make-rule-reading">Read it as: <strong>“To create dist/index.html, I need src/index.html.”</strong></p><dl class="make-terms"><div><dt>1 · Target — what you want</dt><dd><code>dist/index.html</code> is the generated page. It goes <strong>before the colon</strong>.</dd></div><div><dt>2 · Prerequisite — what it needs</dt><dd><code>src/index.html</code> is the source you edit. It goes <strong>after the colon</strong>. The colon means “depends on.”</dd></div><div><dt>3 · Recipe — how to make it</dt><dd><code>bun scripts/build.js</code> creates the output. This line begins with a <strong>TAB</strong>.</dd></div></dl><p class="make-caption">Make decides <em>when</em> to run the recipe. The build script decides <em>how</em> to turn the source into the output.</p>`,
    example: `<div class="make-code-label">Makefile · one rule</div><pre class="make-rule-code"><code><span class="make-target">dist/index.html</span>: <span class="make-input">src/index.html</span>
<span class="make-tab-marker" aria-label="Tab character">⇥</span><span class="make-recipe">bun scripts/build.js</span></code></pre><p class="make-caption">⇥ shows the TAB indentation; press Tab instead of typing this symbol.</p><div class="make-rule-flow" aria-label="Source is processed by the build script to create the output"><span><small>INPUT</small><code>src/index.html</code></span><span aria-hidden="true">→</span><span><small>BUILD SCRIPT</small><code>build.js</code></span><span aria-hidden="true">→</span><span><small>OUTPUT</small><code>dist/index.html</code></span></div><div class="make-code-label">Ask Make for the target</div><pre><code>make dist/index.html</code></pre><table class="make-command-table"><caption>What happens when you run that command?</caption><thead><tr><th>Files on disk</th><th>Make’s decision</th></tr></thead><tbody><tr><td>Output is missing</td><td>Run the recipe to create it.</td></tr><tr><td>Source saved at 10:05; output built at 10:00</td><td>Source is newer → rebuild.</td></tr><tr><td>Source saved at 10:00; output built at 10:05</td><td>Output is current → skip.</td></tr></tbody></table><p class="make-caption">Make compares file modification times, not contents. In the full project, also list <code>scripts/build.js</code> after the colon so changes to the build script trigger a rebuild.</p>`
  },
  {
    topic: '.PHONY', title: '.PHONY marks an action, not a file',
    body: `<p><code>.PHONY</code> is a special Make target. List task names after it when those names do not represent output files.</p><p>Without this declaration, a file named <code>test</code> can make Make skip a <code>test</code> target with no prerequisites.</p><p>With <code>.PHONY: test</code>, <code>make test</code> runs the recipe even when that file exists.</p>`,
    example: `<div class="make-code-label">Makefile</div><pre><code>.PHONY: test clean

test:
\tbun scripts/check.js

clean:
\tbun scripts/clean.js</code></pre><div class="make-callout">Use it for actions such as test, clean, and serve. Keep real output files such as dist/index.html out of .PHONY so Make can skip unchanged builds.</div>`
  },
  {
    topic: 'Commands', title: 'Essential Make commands',
    body: `<p>Run these in the directory containing your <code>Makefile</code>. Target names such as <code>build</code> and <code>serve</code> come from that file; they are not built-in Make commands.</p><p><code>make</code> normally chooses the first ordinary target. Use an explicit target name when you want a specific task.</p>`,
    example: `<table class="make-command-table"><caption>Commands you will use in the exercises</caption><thead><tr><th>Command</th><th>What it does</th></tr></thead><tbody><tr><td><code>make</code></td><td>Run the default target.</td></tr><tr><td><code>make build</code></td><td>Update the build and its prerequisites.</td></tr><tr><td><code>make test</code></td><td>Run the test target.</td></tr><tr><td><code>make serve</code></td><td>Run the serve target; Ctrl+C stops the local server.</td></tr><tr><td><code>make dev</code></td><td>Run the recipe you create in scenario 5.</td></tr></tbody></table><p class="make-caption">Each scenario includes only the targets it needs. Check its Makefile first.</p>`
  },
  {
    topic: 'Put it together', title: 'Format, test, then serve',
    body: `<p>Put the commands in one <code>dev</code> recipe to run them in order. Make stops this recipe when a command fails.</p><ol><li>Format the source.</li><li>Check that the page has a heading.</li><li>Build and start the server only after the test passes.</li></ol><p>The server stays last because it keeps running until you stop it.</p>`,
    example: `<div class="make-code-label">Makefile · scenario 5</div><pre><code>.PHONY: dev
dev:
\tbun run format
\tbun run test
\tbun run start</code></pre><div class="make-code-label">Terminal</div><pre><code>make dev</code></pre><div class="make-callout">A failed test stops the recipe before the build or server starts. In this project, bun run start builds before serving.</div>`
  },
  {
    topic: 'Variables', title: 'Make commands configurable', local: true,
    body: `<p>Use variables for settings that differ between machines. A teammate or CI job can override a default without editing the Makefile.</p><dl class="make-terms"><div><dt>NAME ?= value</dt><dd>Set a default only when the variable is undefined.</dd></div><div><dt>NAME := value</dt><dd>Expand and assign a value immediately.</dd></div><div><dt>$(NAME)</dt><dd>Read a Make variable in a recipe.</dd></div></dl>`,
    example: `<div class="make-code-label">Makefile</div><pre><code>PORT ?= 3000
BUN ?= bun

.PHONY: serve
serve:
\tPORT=$(PORT) $(BUN) scripts/serve.js</code></pre><div class="make-code-label">Terminal</div><pre><code>make serve PORT=4000</code></pre><p class="make-caption">The PORT= prefix passes the value to the server process. Command-line assignments override ordinary Makefile assignments.</p>`
  },
  {
    topic: 'Automatic variables', title: 'Reuse the target and input names', local: true,
    body: `<p>Automatic variables describe the rule Make is currently executing. Use them inside recipes to avoid repeating file paths.</p><dl class="make-terms"><div><dt>$@</dt><dd>The current target.</dd></div><div><dt>$&lt;</dt><dd>The first prerequisite.</dd></div><div><dt>$^</dt><dd>All prerequisites, with duplicates removed.</dd></div></dl>`,
    example: `<div class="make-code-label">A minimal file-copy build</div><pre><code>dist/index.html: src/index.html
\tmkdir -p dist
\tcp "$&lt;" "$@"</code></pre><div class="make-callout">Here, $&lt; becomes src/index.html and $@ becomes dist/index.html.</div><p class="make-caption">This example uses shell commands directly. Use $^ when a command accepts every input, such as a linker combining object files.</p>`
  },
  {
    topic: 'Dependencies & -j', title: 'Declare the order your tasks require', local: true,
    body: `<p><code>make -j4</code> allows up to four recipes to run at once. Independent work can overlap, so prerequisite order alone is not an ordering guarantee.</p><p>If a test reads a built file, make the test depend on that file. List every input that affects the output, including the build script.</p><p>Writing <code>all: build test</code> alone does not force build to finish before test under parallel Make.</p>`,
    example: `<div class="make-code-label">Example: test reads dist/index.html</div><pre><code>.PHONY: all test
all: test

test: dist/index.html
\tbun scripts/test-built.js

dist/index.html: src/index.html scripts/build.js
\tbun scripts/build.js</code></pre><div class="make-callout">Source → built page → test. This dependency chain keeps the test behind the build, even with -j4.</div><p class="make-caption">test-built.js is an example of a test that consumes the build. The lesson’s check.js tests the source instead.</p>`
  },
  {
    topic: 'Shell gotchas', title: 'Each recipe line starts a new shell', local: true,
    body: `<p>By default, a <code>cd</code> or shell variable assignment on one recipe line does not carry into the next. Join related commands with <code>&amp;&amp;</code>.</p><p>Make handles dollar signs first. Write <code>$$</code> when you want the shell to receive a literal dollar sign.</p><p>Recipes normally use <code>/bin/sh</code>. Your interactive Bash or Zsh settings do not automatically apply.</p>`,
    example: `<div class="make-code-label">Keep directory changes in the same shell</div><pre><code>.PHONY: test-web show-path
test-web:
\tcd web &amp;&amp; bun run test

show-path:
\t@echo "Shell PATH: $$PATH"</code></pre><div class="make-callout">TAB starts a recipe line. @ hides the command’s echo, but still shows its output.</div><p class="make-caption">Avoid prefixing checks with a minus sign: that tells Make to ignore their failure.</p>`
  },
  {
    topic: 'Debugging', title: 'Inspect a build before changing it', local: true,
    body: `<p>When Make skips work or runs more than expected, inspect its commands and prerequisites first.</p><ul><li><strong>Missing separator:</strong> check for spaces where a recipe needs a TAB.</li><li><strong>No rule to make target:</strong> check the target name, path, and working directory.</li><li><strong>Stale output:</strong> check for a missing prerequisite or misleading modification time.</li></ul>`,
    example: `<table class="make-command-table"><caption>Useful local debugging commands</caption><thead><tr><th>Command</th><th>Purpose</th></tr></thead><tbody><tr><td><code>make -n build</code></td><td>Print the recipes Make would normally run.</td></tr><tr><td><code>make --debug=b build</code></td><td>Show basic reasons for rebuilding targets.</td></tr><tr><td><code>make -B build</code></td><td>Force a rebuild to investigate skipped work.</td></tr><tr><td><code>make -C web test</code></td><td>Run the test target from the web directory.</td></tr></tbody></table><p class="make-caption">-B executes recipes. -n is not a sandbox: recursive Make recipes and Makefile remaking can still execute commands.</p>`
  },
  {
    topic: 'Team & CI', title: 'Use the same checks locally and in CI', local: true,
    body: `<p>Give the team one entry point such as <code>make check</code>. Run the same target in CI so the commands stay in one place.</p><ul><li>Install the required tools and locked dependencies first.</li><li>Use checks that exit; keep long-running servers out of CI checks.</li><li>Check formatting in CI instead of rewriting files.</li><li>Let failed checks return a nonzero exit status.</li></ul>`,
    example: `<div class="make-code-label">Example project with lint and format:check scripts</div><pre><code>.DEFAULT_GOAL := check
.PHONY: check

check:
\tbun run format:check
\tbun run lint
\tbun run test</code></pre><div class="make-code-label">Local terminal or CI command</div><pre><code>make check</code></pre><p class="make-caption">Define these scripts in package.json. This recipe stops at the first failure. Keep automatic formatting as a separate developer task.</p>`
  }

];

export function makeSlidesMarkup() {
  return `<section class="make-deck" aria-labelledby="make-deck-title" aria-roledescription="carousel">
    <header class="make-deck-heading"><div><div class="eyebrow">BEFORE YOU PRACTICE</div><h2 id="make-deck-title">Makefile essentials</h2></div><span id="make-slide-count" aria-live="polite" aria-atomic="true">Slide 1 of ${slides.length}</span></header>
    <nav class="make-slide-topics" aria-label="Makefile slide topics">${[{label:'Start here · 5 essentials',from:0,to:5},{label:'Go further · Everyday development',from:5,to:slides.length}].map(group=>`<div class="make-topic-group"><span class="make-topic-label">${group.label}</span><div>${slides.slice(group.from,group.to).map((slide,offset)=>{const i=group.from+offset;return `<button type="button" data-make-slide="${i}" aria-pressed="${i===0}" aria-controls="make-slide-${i}">${i+1}. ${slide.topic}</button>`;}).join('')}</div></div>`).join('')}</nav>
    <div class="make-slide-stage">${slides.map((slide,i)=>`<article id="make-slide-${i}" class="make-slide" aria-labelledby="make-slide-title-${i}" aria-roledescription="slide" ${i?'hidden':''}><div class="make-slide-copy">${slide.local?'<p class="make-local-note">LOCAL GNU MAKE · Beyond the browser simulator</p>':''}<h3 id="make-slide-title-${i}">${slide.title}</h3>${slide.body}</div><div class="make-slide-example">${slide.example}</div></article>`).join('')}</div>
    <footer class="make-deck-controls"><a href="https://www.gnu.org/software/make/manual/html_node/Introduction.html" target="_blank" rel="noopener noreferrer">GNU Make manual ↗</a><div><button type="button" class="secondary" id="make-slide-prev" disabled>← Previous</button><button type="button" class="secondary" id="make-slide-next">Next →</button></div></footer>
  </section>`;
}

export function mountMakeSlides(root) {
  const topics=[...root.querySelectorAll('[data-make-slide]')];
  const panels=[...root.querySelectorAll('.make-slide')];
  const previous=root.querySelector('#make-slide-prev');
  const next=root.querySelector('#make-slide-next');
  let current=0;
  function show(index) {
    current=Math.max(0,Math.min(slides.length-1,index));
    topics.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===current)));
    panels.forEach((panel,i)=>panel.hidden=i!==current);
    previous.disabled=current===0;
    next.disabled=current===slides.length-1;
    root.querySelector('#make-slide-count').textContent=`Slide ${current+1} of ${slides.length}`;
  }
  topics.forEach((button,i)=>button.addEventListener('click',()=>show(i)));
  previous.addEventListener('click',()=>show(current-1));
  next.addEventListener('click',()=>show(current+1));
  root.querySelector('.make-slide-topics').addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();
    show(event.key==='Home'?0:event.key==='End'?slides.length-1:current+(event.key==='ArrowRight'?1:-1));
    topics[current].focus();
  });
}
