import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import Modal from '../src/components/common/Modal';

describe('Modal Component', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = '';
  });

  test('does not render when isOpen is false', () => {
    const { container } = render(
      <Modal isOpen={false} onClose={mockOnClose}>
        <div>Modal Content</div>
      </Modal>
    );

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe('');
  });

  test('renders children when isOpen is true without title', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Modal Content</div>
      </Modal>
    );

    expect(screen.getByText('Modal Content')).toBeInTheDocument();
    expect(document.body.style.overflow).toBe('hidden');
    const dialog = screen.getByRole('dialog');
    expect(dialog).not.toHaveAttribute('aria-labelledby');
  });

  test('renders header and title when title prop is provided', async () => {
    const user = userEvent.setup();
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal Title">
        <div>Modal Content</div>
      </Modal>
    );

    const titleElement = screen.getByRole('heading', { name: 'Test Modal Title' });
    expect(titleElement).toBeInTheDocument();
    expect(titleElement).toHaveAttribute('id', 'modal-title');

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');

    const closeBtn = screen.getByRole('button');
    await user.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('closes on Escape key press', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Modal Content</div>
      </Modal>
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('does not close on other key press (e.g. Enter)', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Modal Content</div>
      </Modal>
    );

    fireEvent.keyDown(document, { key: 'Enter' });
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  test('closes when clicking backdrop', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Modal Content</div>
      </Modal>
    );

    const backdrop = screen.getByRole('dialog');
    fireEvent.click(backdrop);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('does not close when clicking inside modal content panel', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div id="inner-content">Modal Content</div>
      </Modal>
    );

    const content = screen.getByText('Modal Content');
    fireEvent.click(content);
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  test('restores document body overflow on unmount', () => {
    const { unmount } = render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Modal Content</div>
      </Modal>
    );

    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).toBe('');
  });
});
