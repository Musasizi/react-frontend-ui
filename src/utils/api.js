// Centralized API utility for backend requests
const API_BASE = 'http://localhost:3000/api';

export const login = (username, password) =>
  fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  }).then(res => res.json());

export const register = (username, password, email) =>
  fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, email })
  }).then(res => res.json());

export const getChapters = (token) =>
  fetch(`${API_BASE}/chapters`, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(res => res.json());

export const getChapter = (id, token) =>
  fetch(`${API_BASE}/chapters/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(res => res.json());

export const createChapter = (chapter, token) =>
  fetch(`${API_BASE}/chapters`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(chapter)
  }).then(res => res.json());

export const updateChapter = (id, chapter, token) =>
  fetch(`${API_BASE}/chapters/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(chapter)
  }).then(res => res.json());

export const deleteChapter = (id, token) =>
  fetch(`${API_BASE}/chapters/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  }).then(res => res.json());

export const getUsers = (token) =>
  fetch(`${API_BASE}/users`, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(res => res.json());

export const updateUser = (id, user, token) =>
  fetch(`${API_BASE}/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(user)
  }).then(res => res.json());

export const deleteUser = (id, token) =>
  fetch(`${API_BASE}/users/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  }).then(res => res.json());

export const addUserToChapter = (userId, chapterId, token) =>
  fetch(`${API_BASE}/chapters/add-user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ userId, chapterId })
  }).then(res => res.json());

export const getUsersInChapter = (chapterId, token) =>
  fetch(`${API_BASE}/chapters/${chapterId}/users`, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(res => res.json());
