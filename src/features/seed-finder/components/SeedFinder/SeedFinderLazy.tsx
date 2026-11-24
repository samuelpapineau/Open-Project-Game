'use client';
import dynamic from 'next/dynamic';
import styles from './SeedFinder.module.css';
// Code-split: the map + worker client download only on pages that actually render the finder.
const SeedFinder = dynamic(() => import('./SeedFinder'), { ssr: false, loading: () => <div className={styles.skeleton} aria-busy /> });
export default SeedFinder;
