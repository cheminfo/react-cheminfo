import type { IconName } from '@blueprintjs/core';
import { Button, ButtonGroup } from '@blueprintjs/core';
import type { ReactElement } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';
import type { SharePreviewDeviceKey, SharePreviewSize } from '../core/index.ts';
import { SHARE_PREVIEW_DEVICES, sharePreviewSize } from '../core/index.ts';

/**
 * The glyph each screen is picked by: a window of one's own, a phone, a
 * monitor, a projected display. The row reads as four screen sizes at a
 * glance, which four words never did.
 */
const DEVICE_ICONS: Record<SharePreviewDeviceKey, IconName> = {
  window: 'application',
  mobile: 'mobile-phone',
  laptop: 'desktop',
  hd: 'presentation',
};

export interface SharePreviewDevicesProps {
  /** The screen the preview is laid out at. */
  value: SharePreviewDeviceKey;
  /** Called with the screen picked. */
  onChange: (value: SharePreviewDeviceKey) => void;
  /** The reader's own window, which the first screen is measured from. */
  windowSize: Partial<SharePreviewSize>;
}

/**
 * The screens a link can be looked at on, as one row of glyphs.
 *
 * Each carries its name and its size, so a pointer resting on one says what it
 * lays the page out at rather than leaving the reader to guess the icon.
 * @param props - See {@link SharePreviewDevicesProps}.
 * @returns The row of screen buttons.
 */
export function SharePreviewDevices(
  props: SharePreviewDevicesProps,
): ReactElement {
  const { value, onChange, windowSize } = props;
  const t = useChromeT();

  return (
    <ButtonGroup className="share-preview__devices" variant="minimal">
      {SHARE_PREVIEW_DEVICES.map((key) => {
        const size = sharePreviewSize(key, windowSize);
        const name = t(`share.device.${key}`);
        const label = t('share.deviceSize', {
          name,
          width: size.width,
          height: size.height,
        });

        return (
          <Button
            key={key}
            icon={DEVICE_ICONS[key]}
            active={key === value}
            title={label}
            aria-label={label}
            onClick={() => {
              onChange(key);
            }}
          />
        );
      })}
    </ButtonGroup>
  );
}
