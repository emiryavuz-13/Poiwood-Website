import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import Toast from './Toast';
import { triggerActionToast } from '../utils/toast';

describe('Toast', () => {
  test('onay bekleyen silme talebini erişilebilir bildirim olarak gösterir', () => {
    render(<Toast />);

    act(() => triggerActionToast({
      type: 'pending',
      title: 'Silme talebi alındı',
      message: 'Talebiniz Panelistan yönetici onayına gönderildi.',
    }));

    expect(screen.getByRole('status')).toHaveTextContent('Silme talebi alındı');
    expect(screen.getByRole('status')).toHaveTextContent('yönetici onayına gönderildi');
    fireEvent.click(screen.getByRole('button', { name: 'Bildirimi kapat' }));
  });
});
