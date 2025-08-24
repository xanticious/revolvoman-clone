import { campaignLevels } from '../../../data/levels';
import CampaignLevelClient from './CampaignLevelClient';

// Generate static params for all available levels
export function generateStaticParams() {
  return campaignLevels.map((level) => ({
    level: level.id.toString(),
  }));
}

export default function CampaignLevelPage() {
  return <CampaignLevelClient />;
}
