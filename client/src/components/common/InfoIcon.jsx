import { Info } from 'lucide-react';
import Tooltip from './Tooltip';

const InfoIcon = ({ content, size = 16 }) => (
  <Tooltip content={content}>
    <button className="inline-flex p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-full transition">
      <Info size={size} className="text-blue-600 dark:text-blue-400" />
    </button>
  </Tooltip>
);

export default InfoIcon;