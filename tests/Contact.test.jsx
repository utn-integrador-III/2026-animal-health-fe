import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import Contact from '../src/pages/public/Contact';
import { sendContactMessage } from '../src/services/contactService';

vi.mock('../src/services/contactService', () => ({
  sendContactMessage: vi.fn(),
}));

function renderContact() {
  return render(
    <MemoryRouter initialEntries={['/contact']}>
      <Contact />
    </MemoryRouter>,
  );
}

async function fillContactForm(user) {
  await user.type(screen.getByLabelText(/name/i), 'Abby Ramirez');
  await user.type(screen.getByLabelText(/^email/i), 'abbyra@gmail.com');
  await user.type(screen.getByLabelText(/phone number/i), '45871263');
  await user.type(screen.getByLabelText(/what do you have in mind/i), 'Consulta veterinaria');
  await user.type(
    screen.getByLabelText(/message/i),
    'Quisiera consultar horarios disponibles para una revision.',
  );
}

describe('Contact', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('sends the public contact form to the backend', async () => {
    const user = userEvent.setup();
    sendContactMessage.mockResolvedValueOnce({ status: 'sent' });

    renderContact();
    await fillContactForm(user);
    await user.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(sendContactMessage).toHaveBeenCalledWith({
        name: 'Abby Ramirez',
        email: 'abbyra@gmail.com',
        phone: '45871263',
        subject: 'Consulta veterinaria',
        message: 'Quisiera consultar horarios disponibles para una revision.',
      });
    });
    expect(await screen.findByText(/your message was sent successfully/i)).toBeInTheDocument();
  });

  test('shows backend errors without opening an automatic mail app fallback', async () => {
    const user = userEvent.setup();
    sendContactMessage.mockRejectedValueOnce({
      response: { data: { detail: 'SendGrid configuration is incomplete.' } },
    });

    renderContact();
    await fillContactForm(user);
    await user.click(screen.getByRole('button', { name: /send/i }));

    expect(await screen.findByText(/sendgrid configuration is incomplete/i)).toBeInTheDocument();
  });
});
