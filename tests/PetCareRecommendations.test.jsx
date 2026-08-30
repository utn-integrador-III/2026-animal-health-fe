import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import PetCareRecommendations from '../src/pages/client/ai/PetCareRecommendations';
import useLanguageStore from '../src/stores/useLanguageStore';

const hookState = vi.hoisted(() => ({
  result: {
    data: null,
    isLoading: false,
    isError: false,
    refresh: vi.fn(),
    isRefreshing: false,
    refreshError: false,
  },
}));

vi.mock('../src/hooks/usePetCareRecommendations', () => ({
  usePetCareRecommendations: vi.fn(() => hookState.result),
}));

function recommendationData() {
  return {
    pet_id: 'pet-1',
    name: 'Nino',
    species: 'Dog',
    breed_primary: 'Cairn terrier',
    breed_secondary: 'Chihuahua',
    birth_date: '2024-04-10',
    age_years: 2,
    age_months: 4,
    age_days: 11,
    nutrition_recommendations: [
      'Use balanced portions for a small mixed-breed dog.',
    ],
    activity_recommendations: [
      'Plan short daily walks and gentle play.',
    ],
    preventive_recommendations: [
      'Schedule regular dental checks.',
    ],
    non_diagnostic_warning: 'This guidance is informational only.',
    generated_by: 'gemini',
    recommendation_id: 'latest',
    history: [
      {
        recommendation_id: 'latest',
        generated_at: '2026-08-21T12:00:00+00:00',
        nutrition_recommendations: [
          'Use balanced portions for a small mixed-breed dog.',
        ],
        activity_recommendations: [
          'Plan short daily walks and gentle play.',
        ],
        preventive_recommendations: [
          'Schedule regular dental checks.',
        ],
        non_diagnostic_warning: 'This guidance is informational only.',
        generated_by: 'gemini',
      },
      {
        recommendation_id: 'previous',
        generated_at: '2026-08-20T12:00:00+00:00',
        nutrition_recommendations: ['Previous nutrition guidance.'],
        activity_recommendations: ['Previous activity guidance.'],
        preventive_recommendations: ['Previous prevention guidance.'],
        non_diagnostic_warning: 'Previous warning.',
        generated_by: 'gemini',
      },
    ],
  };
}

function renderPage(initialPath = '/client/recommendations?petId=pet-1') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/client/recommendations" element={<PetCareRecommendations />} />
        <Route path="/client/dashboard" element={<h1>Dashboard</h1>} />
        <Route path="/client/pets" element={<h1>Pets</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('PetCareRecommendations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useLanguageStore.getState().setLanguage('en');
    hookState.result = {
      data: recommendationData(),
      isLoading: false,
      isError: false,
      refresh: vi.fn(),
      isRefreshing: false,
      refreshError: false,
    };
  });

  test('renders patient context and client care recommendations', () => {
    renderPage();

    expect(screen.getByRole('heading', { name: /personalized preventive care/i })).toBeInTheDocument();
    expect(screen.getByText('Nino')).toBeInTheDocument();
    expect(screen.getByText('Cairn terrier')).toBeInTheDocument();
    expect(screen.getByText('Chihuahua')).toBeInTheDocument();
    expect(screen.getByText(/2 years, 4 months, 11 days/i)).toBeInTheDocument();
    expect(screen.getByText(/balanced portions/i)).toBeInTheDocument();
    expect(screen.getByText(/short daily walks/i)).toBeInTheDocument();
    expect(screen.getByText(/regular dental checks/i)).toBeInTheDocument();
    expect(screen.getByText(/informational only/i)).toBeInTheDocument();
  });

  test('lets the client select a previous recommendation from history', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.selectOptions(
      screen.getByLabelText(/recommendation history/i),
      'previous',
    );

    expect(screen.getByText('Previous nutrition guidance.')).toBeInTheDocument();
    expect(screen.getByText('Previous activity guidance.')).toBeInTheDocument();
    expect(screen.getByText('Previous prevention guidance.')).toBeInTheDocument();
  });

  test('calls refresh when the update button is clicked', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /update ai recommendation/i }));

    expect(hookState.result.refresh).toHaveBeenCalledTimes(1);
  });

  test('shows loading state while recommendations are requested', () => {
    hookState.result = {
      data: null,
      isLoading: true,
      isError: false,
      refresh: vi.fn(),
      isRefreshing: false,
      refreshError: false,
    };

    renderPage();

    expect(screen.getByText(/generating preventive care recommendations/i)).toBeInTheDocument();
  });

  test('shows an error state when recommendations fail', () => {
    hookState.result = {
      data: null,
      isLoading: false,
      isError: true,
      refresh: vi.fn(),
      isRefreshing: false,
      refreshError: false,
    };

    renderPage();

    expect(screen.getByText(/ai recommendations could not be loaded/i)).toBeInTheDocument();
  });

  test('asks the client to select a pet when petId is missing', () => {
    renderPage('/client/recommendations');

    expect(screen.getByRole('heading', { name: /select a pet first/i })).toBeInTheDocument();
    expect(screen.getByText(/open preventive recommendations from a pet health dashboard/i)).toBeInTheDocument();
  });
});
