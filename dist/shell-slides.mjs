const slides = [
  {
    "topic": "Terminal & shell",
    "title": "Your terminal hosts a shell",
    "body": "<p>The terminal is the text interface where you type commands and read output. The shell interprets those commands and starts programs. An IDE can embed a terminal too.</p><p>This practice terminal starts in Zsh. You can switch to Bash to compare their behavior.</p>",
    "example": "<ol class=\"work-diagram\"><li><span class=\"work-diagram-step\">TYPE</span><strong>Terminal</strong><small>Enter a command</small></li><li><span class=\"work-diagram-step\">INTERPRET</span><strong>Zsh / Bash</strong><small>Expand and run it</small></li><li><span class=\"work-diagram-step\">READ</span><strong>Output</strong><small>See the result</small></li></ol><div class=\"make-code-label\">Try your first command</div><pre><code>pwd\n/home/learner/project</code></pre><p class=\"make-caption\">This is a virtual project. Commands here do not access your computer.</p>"
  },
  {
    "topic": "Find your files",
    "title": "Start with where you are",
    "body": "<p><code>pwd</code> prints your current directory. <code>ls</code> lists its visible entries, and <code>cd</code> changes directories.</p><p>Relative paths start at the current directory. Absolute paths start at <code>/</code>. Use <code>..</code> for the parent directory and <code>~</code> for your home directory.</p>",
    "example": "<div class=\"make-code-label\">Explore the practice project</div><pre><code>pwd\nls\ncd src\ncat index.html\ncd ..\nls -la</code></pre><div class=\"make-callout\"><code>cat</code> reads a file. Names starting with a dot are hidden from ordinary <code>ls</code>; <code>ls -a</code> includes them. Add <code>-l</code> for details.</div>"
  },
  {
    "topic": "Variables & quotes",
    "title": "Keep values together with quotes",
    "body": "<p>A variable gives a value a name. <code>export</code> makes that value available in the environment of programs started by the shell.</p><p>Double quotes expand variables while keeping a value together. Single quotes preserve the literal text, including the dollar sign.</p>",
    "example": "<div class=\"make-code-label\">Compare the output</div><pre><code>export NAME=\"Hello Arise\"\necho \"$NAME\"\nHello Arise\n\necho '$NAME'\n$NAME</code></pre><div class=\"make-callout\">Quote variable expansions when you want to pass a value as one argument, especially when it contains spaces.</div>"
  },
  {
    "topic": "Pipes & files",
    "title": "Send text to the next command",
    "body": "<p>A pipe, <code>|</code>, sends a command’s standard output into the next command’s standard input. <code>grep</code> keeps matching lines; <code>wc -l</code> counts lines.</p><p>Use <code>&gt;</code> to write output to a file, replacing its contents. Use <code>&gt;&gt;</code> to append instead.</p>",
    "example": "<div class=\"make-code-label\">Count successful requests</div><pre><code>cat access.log | grep 200 | wc -l\n3</code></pre><div class=\"make-code-label\">Write, append, and read</div><pre><code>echo \"Hello Arise\" &gt; greeting.txt\necho \"Welcome back\" &gt;&gt; greeting.txt\ncat greeting.txt</code></pre><p class=\"make-caption\">Read the exit status too: 0 usually means success. For grep, 1 means no matching lines.</p>"
  },
  {
    "topic": "Bash & Zsh",
    "title": "The same pattern can behave differently",
    "body": "<p>Most commands here work in both shells. A filename pattern such as <code>*.csv</code> asks the shell to find matching files before running the command.</p><p>With default settings, Bash leaves an unmatched pattern literal. Zsh reports an error. Settings can change this behavior.</p><p><code>~/.bashrc</code> and <code>~/.zshrc</code> commonly configure interactive shells. Bash login shells use different startup files. This simulator does not load these files.</p>",
    "example": "<div class=\"make-code-label\">No CSV files in this project</div><pre><code>bash\necho *.csv\n*.csv\n\nzsh\necho *.csv\nzsh: no matches found: *.csv</code></pre><div class=\"make-callout\"><code>echo \"$SHELL\"</code> shows the selected mode here. On a real machine, $SHELL usually identifies your login shell.</div>"
  },
  {
    "topic": "Try the loop",
    "title": "Run a command, then inspect the result",
    "body": "<ol><li>Choose a practice exercise below.</li><li>Read the goal and run commands in the terminal.</li><li>Check the output, exit status, and file browser.</li><li>Use a hint if needed, then move to the next exercise.</li></ol><p>Start with navigation, then try variables, pipes, and writing files. Finish by comparing Bash and Zsh.</p>",
    "example": "<div class=\"make-code-label\">Useful terminal controls</div><table class=\"make-command-table\"><thead><tr><th>Control</th><th>What it does here</th></tr></thead><tbody><tr><td>Enter</td><td>Run your command.</td></tr><tr><td>↑ / ↓</td><td>Recall command history.</td></tr><tr><td>Tab</td><td>Complete a unique command name.</td></tr><tr><td>help</td><td>List supported commands.</td></tr><tr><td>Reset practice files</td><td>Restore files, progress, and Zsh mode.</td></tr></tbody></table>"
  }
];
export function shellSlidesMarkup() {
  return `<section class="make-deck shell-deck" aria-labelledby="shell-deck-title" aria-roledescription="carousel"><header class="make-deck-heading"><div><div class="eyebrow">BEFORE YOU PRACTICE</div><h2 id="shell-deck-title">Bash &amp; Zsh essentials</h2></div><span class="shell-slide-count" aria-live="polite" aria-atomic="true">Slide 1 of ${slides.length}</span></header><nav class="make-slide-topics" aria-label="Shell slide topics"><div class="make-topic-group"><div>${slides.map((s,i)=>`<button type="button" data-shell-slide="${i}" aria-pressed="${i===0}" aria-controls="shell-slide-${i}">${i+1}. ${s.topic}</button>`).join('')}</div></div></nav><div class="make-slide-stage">${slides.map((s,i)=>`<article class="make-slide" id="shell-slide-${i}" aria-labelledby="shell-slide-title-${i}" aria-roledescription="slide" ${i?'hidden':''}><div class="make-slide-copy"><h3 id="shell-slide-title-${i}">${s.title}</h3>${s.body}</div><div class="make-slide-example">${s.example}</div></article>`).join('')}</div><footer class="make-deck-controls"><span>Understand the command, then try it below.</span><div><button type="button" class="secondary" data-shell-prev disabled>← Previous</button><button type="button" class="secondary" data-shell-next>Next →</button></div></footer></section>`;
}
export function mountShellSlides(root) {
 const buttons=[...root.querySelectorAll('[data-shell-slide]')],panels=[...root.querySelectorAll('.make-slide')],prev=root.querySelector('[data-shell-prev]'),next=root.querySelector('[data-shell-next]');let current=0;
 function show(i){current=Math.max(0,Math.min(slides.length-1,i));buttons.forEach((b,j)=>b.setAttribute('aria-pressed',String(j===current)));panels.forEach((p,j)=>p.hidden=j!==current);prev.disabled=current===0;next.disabled=current===slides.length-1;root.querySelector('.shell-slide-count').textContent=`Slide ${current+1} of ${slides.length}`;}
 buttons.forEach((b,i)=>b.addEventListener('click',()=>show(i)));prev.addEventListener('click',()=>show(current-1));next.addEventListener('click',()=>show(current+1));root.querySelector('nav').addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();show(e.key==='Home'?0:e.key==='End'?slides.length-1:current+(e.key==='ArrowRight'?1:-1));buttons[current].focus();});
}
