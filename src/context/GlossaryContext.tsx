// src/context/GlossaryContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from "react";

export interface GlossaryEntry {
  id: string;
  title: string;
  category: string;
  tags?: string[]; // Made optional to match typical frontmatter
  excerpt?: string; // Made optional
  aliases?: string[]; // Made optional
  seeAlso?: string[]; // Made optional
  filePath: string;
}

interface MainIndexFile {
  index_files: string[];
}

const GlossaryContext = createContext<GlossaryEntry[] | null>(null);

export function GlossaryProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<GlossaryEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGlossaryData = async () => {
      try {
        // 1. Fetch the main index file
        const mainIndexResponse = await fetch("/data/glossary/index/main.json");
        if (!mainIndexResponse.ok) {
          throw new Error(`Failed to fetch main glossary index: ${mainIndexResponse.status} ${mainIndexResponse.statusText}`);
        }
        const mainIndex: MainIndexFile = await mainIndexResponse.json();

        if (!mainIndex.index_files || mainIndex.index_files.length === 0) {
          console.warn("Main glossary index is empty or has no files listed.");
          setEntries([]);
          return;
        }

        // 2. Fetch all category-specific index files
        const allCategoryEntriesPromises = mainIndex.index_files.map(filePath =>
          fetch(filePath)
            .then(res => {
              if (!res.ok) {
                throw new Error(`Failed to fetch category index ${filePath}: ${res.status} ${res.statusText}`);
              }
              return res.json() as Promise<GlossaryEntry[]>;
            })
            .catch(err => {
              console.error(`Error loading category index ${filePath}:`, err);
              return []; // Return empty array for this category on error to not break everything
            })
        );

        const nestedEntriesArray = await Promise.all(allCategoryEntriesPromises);
        
        // 3. Concatenate all entries
        const combinedEntries = nestedEntriesArray.flat();
        
        // Optional: Deduplicate if IDs might somehow overlap across files (shouldn't if generated correctly)
        const uniqueEntriesMap = new Map<string, GlossaryEntry>();
        combinedEntries.forEach(entry => {
          if (!uniqueEntriesMap.has(entry.id)) {
            uniqueEntriesMap.set(entry.id, entry);
          } else {
            console.warn(`Duplicate glossary ID found during context load: ${entry.id}. Keeping first instance.`);
          }
        });
        
        setEntries(Array.from(uniqueEntriesMap.values()));
        setError(null);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error("Failed to load complete glossary index:", errorMessage);
        setError(errorMessage);
        setEntries([]); // Degrade gracefully
      }
    };

    fetchGlossaryData();
  }, []);

  // If an error occurred, you might want to provide it via context or handle it differently
  if (error && entries === null) { // Still loading but an error occurred
      // return <GlossaryContext.Provider value={[]}>{children}</GlossaryContext.Provider>; // Provide empty or handle error state
  }


  return (
    <GlossaryContext.Provider value={entries}>
      {children}
    </GlossaryContext.Provider>
  );
}

export default GlossaryContext;
