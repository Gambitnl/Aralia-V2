---
id: "dev_test_entry"
title: "Developer Test Entry (Custom Style & Links)"
category: "Developer"
tags: ["test", "dev", "styling", "bard", "sidebar", "skew", "internal-link"]
excerpt: "A test entry to verify custom HTML structure, embedded CSS, and internal glossary linking. Content is about a Bard's Repertoire and includes a link to the Bard class entry."
filePath: "/data/glossary/entries/dev/test_entry.md"
---

<!-- HTML structure: Unskewed with beveled corners via clip-path -->
<aside class="text--rules-sidebar">
  <div class="skew-content">
    <h3>A Bard’s Repertoire</h3>
    <p>Does your <span data-term-id="bard" class="glossary-term-link-from-markdown">Bard</span> beat a drum while chanting the deeds of ancient heroes? Strum a lute while crooning romantic tunes? Perform arias of stirring power? Recite dramatic monologues from classic tragedies? Use the rhythm of a folk dance to coordinate the movement of allies in battle? Compose naughty limericks?</p>
    <p>When you play a <span data-term-id="bard" class="glossary-term-link-from-markdown">Bard</span>, consider the style of artistic performance you favor, the moods you might invoke, and the themes that inspire your own creations. Are your poems inspired by moments of natural beauty, or are they brooding reflections on loss? Do you prefer lofty hymns or rowdy tavern songs? Are you drawn to laments for the fallen or celebrations of joy? Do you dance merry jigs or perform elaborate interpretive choreography? Do you focus on one style of performance or strive to master them all?</p>
    <p>For more on Bards, see the <span data-term-id="bard" class="glossary-term-link-from-markdown">Bard class</span> entry. You can also check out details on <span data-term-id="spellcasting" class="glossary-term-link-from-markdown">spellcasting</span>.</p>
  </div>
</aside>

<!-- CSS styling: beveled corners without skew -->
<style>
.text--rules-sidebar {
  /* Beveled corners using an octagonal clip-path */
  -webkit-clip-path: polygon(
    10px 0, calc(100% - 10px) 0,
    100% 10px, 100% calc(100% - 10px),
    calc(100% - 10px) 100%, 10px 100%,
    0 calc(100% - 10px), 0 10px
  );
          clip-path: polygon(
    10px 0, calc(100% - 10px) 0,
    100% 10px, 100% calc(100% - 10px),
    calc(100% - 10px) 100%, 10px 100%,
    0 calc(100% - 10px), 0 10px
  );

  background: #f5efe6;
  border: 1px solid #333;
  padding: 2em;
  max-width: 640px;
  margin: 3em auto;
  font-family: Georgia, serif;
  color: #222;
}

.text--rules-sidebar h3 {
  margin-top: 0;
  margin-bottom: 0.5em;
  font-size: 1.5em;
  border-bottom: 1px solid rgba(0,0,0,0.15);
  padding-bottom: 0.25em;
}

.text--rules-sidebar p {
  margin: 1em 0;
  line-height: 1.6;
}
</style>
