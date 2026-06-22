import { NextRequest } from 'next/server';
import { createSvg } from '@/lib/github-3d-contrib/create-svg';
import {
  NormalSettings,
  NorthSeasonSettings,
  SouthSeasonSettings,
  NightViewSettings,
  HalloweenSettings,
  GitBlockSettings
} from '@/lib/github-3d-contrib/color-template';
import type { UserInfo } from '@/lib/github-3d-contrib/type';

export const runtime = 'nodejs';

function getMockUserInfo(username: string): UserInfo {
  const contributionCalendar = [];
  const today = new Date();
  
  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - (365 - i));
    
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const baseChance = isWeekend ? 0.2 : 0.8;
    const hasContrib = Math.random() < baseChance;
    const count = hasContrib ? Math.floor(Math.random() * 10) + 1 : 0;
    
    let level = 0;
    if (count > 0 && count <= 2) level = 1;
    else if (count > 2 && count <= 5) level = 2;
    else if (count > 5 && count <= 8) level = 3;
    else if (count > 8) level = 4;
    
    contributionCalendar.push({
      date,
      contributionCount: count,
      contributionLevel: level,
    });
  }

  return {
    isHalloween: false,
    contributionCalendar,
    contributesLanguage: [
      { language: 'TypeScript', color: '#3178c6', contributions: 150 },
      { language: 'JavaScript', color: '#f1e05a', contributions: 50 },
      { language: 'Python', color: '#3572A5', contributions: 30 },
    ],
    totalContributions: 1234,
    totalCommitContributions: 1000,
    totalIssueContributions: 34,
    totalPullRequestContributions: 150,
    totalPullRequestReviewContributions: 50,
    totalRepositoryContributions: 20,
    totalForkCount: 42,
    totalStargazerCount: 999,
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const user = searchParams.get('user') || 'octocat';
    const theme = searchParams.get('theme') || 'github';
    const animate = searchParams.get('animate') === 'true';
    
    let settings: any = NormalSettings;
    if (theme === 'north') settings = NorthSeasonSettings;
    else if (theme === 'south') settings = SouthSeasonSettings;
    else if (theme === 'night') settings = NightViewSettings;
    else if (theme === 'halloween') settings = HalloweenSettings;
    else if (theme === 'gitblock') settings = GitBlockSettings;
    
    const userInfo = getMockUserInfo(user);
    const svgContent = createSvg(userInfo, settings, animate);
    
    return new Response(svgContent, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error generating 3D contrib:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
