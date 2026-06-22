import fs from 'fs';
import path from 'path';
import { IconsPageClient } from './icons-page-client';

export interface IconInfo {
  name: string;
  hasDark: boolean;
  hasLight: boolean;
  hasSingle: boolean;
}

async function getIcons(): Promise<IconInfo[]> {
  const iconsDir = path.join(process.cwd(), 'public', 'assets', 'skills-icon');
  const files = fs.readdirSync(iconsDir);

  const iconMap = new Map<string, IconInfo>();

  for (const file of files) {
    if (!file.endsWith('.svg')) continue;

    const baseName = file.replace('.svg', '');

    if (baseName.endsWith('-Dark')) {
      const name = baseName.slice(0, -5);
      const existing = iconMap.get(name) || { name, hasDark: false, hasLight: false, hasSingle: false };
      existing.hasDark = true;
      iconMap.set(name, existing);
    } else if (baseName.endsWith('-Light')) {
      const name = baseName.slice(0, -6);
      const existing = iconMap.get(name) || { name, hasDark: false, hasLight: false, hasSingle: false };
      existing.hasLight = true;
      iconMap.set(name, existing);
    } else {
      const existing = iconMap.get(baseName) || { name: baseName, hasDark: false, hasLight: false, hasSingle: false };
      existing.hasSingle = true;
      iconMap.set(baseName, existing);
    }
  }

  return Array.from(iconMap.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export default async function IconsPage() {
  const icons = await getIcons();

  return <IconsPageClient icons={icons} />;
}
