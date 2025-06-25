
/**
 * @file Glossary.tsx
 * This component displays an expandable D&D Basic Rules glossary.
 * It now loads an index from a flat JSON file via context and fetches 
 * Markdown content dynamically for selected entries.
 * It uses the 'marked' library to parse Markdown for rich content display.
 */
import React, { useEffect, useRef, useState, useCallback, useContext, useMemo } from 'react';
import GlossaryContext, { GlossaryEntry } from '../context/GlossaryContext'; // Use GlossaryEntry from context
import { GlossaryProps } from '../types';
import { marked } from 'marked';
import Tooltip from './Tooltip'; // For potential internal tooltips if needed

// Helper function to strip YAML frontmatter from Markdown content
const stripYamlFrontmatter = (markdownContent: string): string => {
  // Regex to match YAML frontmatter block:
  // ^\s*      - Matches start of string, allowing optional leading whitespace.
  // ---       - Matches the opening delimiter.
  // ([\s\S]*?) - Non-greedily captures any characters (including newlines) between delimiters.
  // ---       - Matches the closing delimiter.
  // (?:\r?\n|\r|$) - Matches a newline sequence (CRLF, LF, or CR) or the end of the string,
  //                 making the newline after the closing '---' optional.
  const yamlFrontmatterRegex = /^\s*---([\s\S]*?)---(?:\r?\n|\r|$)/;
  const match = markdownContent.match(yamlFrontmatterRegex);

  if (match) {
    // If frontmatter is found, return the content *after* the matched block.
    // trimStart() to remove any leading whitespace from the actual content.
    return markdownContent.substring(match[0].length).trimStart();
  }
  // If no frontmatter is found, return the original content, possibly trimmed of leading whitespace.
  return markdownContent.trimStart();
};

// Internal component to fetch and render full Markdown content
const FullEntryDisplay: React.FC<{ filePath: string, onNavigateToGlossary?: (termId: string) => void }> = ({ filePath, onNavigateToGlossary }) => {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!filePath) {
        setLoading(false);
        setError("No file path provided for glossary entry.");
        return;
    }
    setLoading(true);
    setError(null);
    setContent(null);

    fetch(filePath)
      .then(res => {
        if (!res.ok) throw new Error(`Failed to fetch glossary content from ${filePath}: ${res.status} ${res.statusText}`);
        return res.text();
      })
      .then(text => {
        const html = marked.parse(stripYamlFrontmatter(text), { gfm: true, breaks: true, async: false });
        setContent(html as string); // Cast as string, as marked.parse returns string or Promise<string>
      })
      .catch(err => {
        console.error(`Error fetching or parsing ${filePath}:`, err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [filePath]);

  // Add click listeners to internal glossary links after content is rendered
  useEffect(() => {
    if (content && contentRef.current && onNavigateToGlossary) {
      const links = contentRef.current.querySelectorAll('span.glossary-term-link-from-markdown[data-term-id]');
      links.forEach(link => {
        const termId = link.getAttribute('data-term-id');
        if (termId) {
          const existingHandler = (link as any)._glossaryClickHandler;
          if (existingHandler) {
            link.removeEventListener('click', existingHandler);
          }
          const newHandler = (e: Event) => {
            e.preventDefault();
            e.stopPropagation();
            onNavigateToGlossary(termId);
          };
          (link as any)._glossaryClickHandler = newHandler;
          link.addEventListener('click', newHandler);
          link.setAttribute('role', 'link');
          link.setAttribute('tabindex', '0');
          link.addEventListener('keydown', (e: KeyboardEvent) => {
            if(e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.stopPropagation();
              onNavigateToGlossary(termId);
            }
          });
        }
      });
    }
  }, [content, onNavigateToGlossary]);


  if (loading) return <p className="text-gray-400 italic">Loading full entry...</p>;
  if (error) return <p className="text-red-400">Error loading content: {error}</p>;
  if (!content) return <p className="text-gray-500 italic">No content found for this entry.</p>;

  return <div ref={contentRef} className="prose prose-sm prose-invert max-w-none text-gray-300 leading-relaxed prose-headings:text-amber-300 prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-h4:text-base prose-strong:text-sky-300 prose-a:text-sky-400 hover:prose-a:text-sky-300 prose-blockquote:border-l-sky-500 prose-table:border-gray-600 prose-th:bg-gray-700 prose-th:border-gray-600 prose-td:border-gray-600" dangerouslySetInnerHTML={{ __html: content }} />;
};


const Glossary: React.FC<GlossaryProps> = ({ isOpen, onClose, initialTermId }) => {
  const firstFocusableElementRef = useRef<HTMLButtonElement>(null);
  const glossaryIndex = useContext(GlossaryContext); 
  
  const [selectedEntry, setSelectedEntry] = useState<GlossaryEntry | null>(null);
  const [error, setError] = useState<string | null>(null); 
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  
  const entryRefs = useRef<Record<string, HTMLLIElement | null>>({});

  const handleNavigateToGlossary = useCallback((termId: string) => {
    if (glossaryIndex) {
      const entry = glossaryIndex.find(e => e.id === termId);
      if (entry) {
        setSelectedEntry(entry);
        if (entry.category && !expandedCategories.has(entry.category)) {
          setExpandedCategories(prev => new Set(prev).add(entry.category));
        }
        // Scroll to entry logic is handled in a useEffect below
      } else {
        console.warn(`Glossary internal navigation: Term ID "${termId}" not found.`);
      }
    }
  }, [glossaryIndex, expandedCategories]);


  useEffect(() => {
    if (isOpen && glossaryIndex) { 
      if (initialTermId) {
        handleNavigateToGlossary(initialTermId);
      } else if (!selectedEntry && glossaryIndex.length > 0) {
        // No auto-selection to avoid immediate fetch for the first item
      }
       firstFocusableElementRef.current?.focus();
    } else if (!isOpen) {
      setSelectedEntry(null);
      setExpandedCategories(new Set());
      setSearchTerm('');
    }
  }, [isOpen, initialTermId, glossaryIndex, handleNavigateToGlossary]); // selectedEntry removed to avoid re-trigger

  useEffect(() => {
    if (selectedEntry && entryRefs.current[selectedEntry.id]) {
      entryRefs.current[selectedEntry.id]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedEntry, expandedCategories]); // This effect runs when selectedEntry changes or category expansion changes

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  const handleEntrySelect = useCallback((entry: GlossaryEntry) => {
    setSelectedEntry(entry);
  }, []);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };
  
  const filteredGlossaryIndex = useMemo(() => {
    if (!glossaryIndex) return [];
    if (!searchTerm.trim()) return glossaryIndex;
    const lowerSearchTerm = searchTerm.toLowerCase();
    return glossaryIndex.filter(entry => 
      entry.title.toLowerCase().includes(lowerSearchTerm) ||
      entry.category.toLowerCase().includes(lowerSearchTerm) ||
      (entry.aliases && entry.aliases.some(alias => alias.toLowerCase().includes(lowerSearchTerm))) ||
      (entry.tags && entry.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm)))
    );
  }, [glossaryIndex, searchTerm]);

  if (!isOpen) {
    return null;
  }
  
  if (glossaryIndex === null && !error) { 
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 text-gray-200 p-6 rounded-xl shadow-2xl border border-gray-700">
          <p className="text-gray-400 italic">Loading glossary...</p>
        </div>
      </div>
    );
  }
  
  if ((glossaryIndex && glossaryIndex.length === 0 && !error) || error) { 
    return (
       <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 text-gray-200 p-6 rounded-xl shadow-2xl border border-gray-700">
          <p className="text-red-400">{error || "Glossary index is empty or failed to load. Please check console."}</p>
           <button onClick={onClose} className="mt-4 px-4 py-2 bg-sky-600 text-white rounded">Close</button>
        </div>
      </div>
    )
  }

  const groupedEntries = filteredGlossaryIndex.reduce((acc, entry) => {
    const category = entry.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(entry);
    return acc;
  }, {} as Record<string, GlossaryEntry[]>);

  const sortedCategories = Object.keys(groupedEntries).sort();

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="glossary-title"
    >
      <div className="bg-gray-900 text-gray-200 p-6 rounded-xl shadow-2xl border border-gray-700 w-full max-w-5xl h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-600">
          <h2 id="glossary-title" className="text-3xl font-bold text-amber-400 font-cinzel">
            Game Glossary
          </h2>
          <button
            ref={firstFocusableElementRef}
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 text-3xl p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400"
            aria-label="Close glossary"
          >
            &times;
          </button>
        </div>
        
        <div className="mb-4">
          <input
            type="search"
            placeholder="Search glossary (e.g., Rage, Spell Slot, Expertise)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none"
            aria-label="Search glossary terms"
          />
        </div>

        <div className="flex-grow flex flex-col md:flex-row gap-4 overflow-hidden min-h-0">
          <div className="md:w-1/3 border border-gray-700 rounded-lg bg-gray-800/50 p-2 overflow-y-auto scrollable-content flex-shrink-0">
            {filteredGlossaryIndex.length === 0 && !error && <p className="text-gray-500 italic text-center py-4">No terms match your search.</p>}
            {sortedCategories.map(category => (
              <details key={category} open={expandedCategories.has(category) || !!searchTerm} className="mb-1">
                <summary 
                    className="p-2 font-semibold text-sky-300 cursor-pointer hover:bg-gray-700/50 transition-colors rounded-md text-lg list-none flex justify-between items-center"
                    onClick={(e) => { e.preventDefault(); toggleCategory(category); }} 
                >
                  {category} ({groupedEntries[category].length})
                  <span className={`transform transition-transform ${(expandedCategories.has(category) || !!searchTerm) ? 'rotate-90' : ''}`}>▶</span>
                </summary>
                {(expandedCategories.has(category) || !!searchTerm) && (
                    <ul className="space-y-0.5 pl-3 pt-1">
                    {groupedEntries[category].sort((a,b) => a.title.localeCompare(b.title)).map(entry => (
                        <li key={entry.id} ref={el => { entryRefs.current[entry.id] = el; }}>
                        <button
                            onClick={() => handleEntrySelect(entry)}
                            className={`w-full text-left px-2 py-1.5 rounded-md transition-colors text-sm 
                                        ${selectedEntry?.id === entry.id ? 'bg-sky-700 text-white shadow-sm' : 'bg-gray-700/60 hover:bg-gray-600/80 text-gray-300'}`}
                        >
                            {entry.title}
                        </button>
                        </li>
                    ))}
                    </ul>
                )}
              </details>
            ))}
          </div>

          <div className="flex-grow md:w-2/3 border border-gray-700 rounded-lg bg-gray-800/50 p-4 overflow-y-auto scrollable-content">
            {selectedEntry ? (
              <FullEntryDisplay filePath={selectedEntry.filePath} onNavigateToGlossary={handleNavigateToGlossary} />
            ) : (
              <p className="text-gray-500 italic text-center py-10">Select an entry to view its details.</p>
            )}
          </div>
        </div>
         <div className="mt-6 pt-4 border-t border-gray-600 flex justify-end">
            <button
                onClick={onClose}
                className="px-6 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg shadow"
                aria-label="Close glossary"
            >
                Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default Glossary;
