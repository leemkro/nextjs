'use client';

import { getToken } from './authStore';

const API_BASE = 'http://localhost:8080/api';

export const api = {
    async request(url: string, options: RequestInit = {}) {
        const token = getToken();
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE}${url}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Request failed' }));
            throw new Error(error.error || 'Request failed');
        }

        return response.json();
    },

    get(url: string) {
        return this.request(url);
    },

    post(url: string, data: any) {
        return this.request(url, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    put(url: string, data: any) {
        return this.request(url, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    delete(url: string) {
        return this.request(url, {
            method: 'DELETE',
        });
    },
};
