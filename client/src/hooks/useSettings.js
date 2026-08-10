import { useQuery } from '@tanstack/react-query';
import { settingService } from '../services/setting.service';

export const useSettings = () => {
  return useQuery({
    queryKey: ['public-settings'],
    queryFn: () => settingService.getSettings().then(res => res?.data || res),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
};
