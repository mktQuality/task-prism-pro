import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/database';

export type PublicProfile = {
  user_id: string;
  name: string;
  role: UserRole;
  sector: string | null;
};

export const usePublicProfiles = () => {
  return useQuery<PublicProfile[]>({
    queryKey: ['public-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('list_profiles_minimal');
      if (error) throw error;
      return (data || []) as PublicProfile[];
    },
  });
};
