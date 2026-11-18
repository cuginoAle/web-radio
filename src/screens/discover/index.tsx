import { ScrollView } from 'react-native';

import type { FavoriteItem } from '@/db/queries/favorites';
import { useTopFavorites } from '@/hooks/favorites/useTopFavorites';
import { openTag } from '@/hooks/stations/useOpenTag';
import { useTags } from '@/hooks/stations/useTags';
import { useInstallUpdate } from '@/hooks/updates/useInstallUpdate';
import { useUpdateNotice } from '@/hooks/updates/useUpdateNotice';
import { DiscoverHeader } from '@/screens/discover/DiscoverHeader';
import { styles } from '@/screens/discover/styles';
import { UpdateNotice } from '@/components/UpdateNotice';
import { playFromList } from '@/services/audio/playFromList';

const TOP_TAGS = 24;

export function DiscoverScreen() {
  const tags = useTags(TOP_TAGS);
  const topFavorites = useTopFavorites();
  const { notice, snooze } = useUpdateNotice();
  const install = useInstallUpdate(notice);

  // Previous / next move among the pills (GLOSSARY: Source list).
  const play = (station: FavoriteItem) => void playFromList(station, async () => topFavorites.map((f) => f.uuid));

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {notice ? (
        <UpdateNotice
          version={notice.version}
          status={install.status}
          percent={install.percent}
          onInstall={install.install}
          onDismiss={snooze}
        />
      ) : null}
      <DiscoverHeader tags={tags} onOpenTag={openTag} topFavorites={topFavorites} onPlayFavorite={play} />
    </ScrollView>
  );
}
