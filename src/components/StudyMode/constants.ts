import { SoundOption } from './types';

export const SOUNDS: SoundOption[] = [
    { id: 'none', label: 'Silent', url: '' },
    { id: 'rain', label: 'Rain', url: 'https://cdn.pixabay.com/download/audio/2022/07/04/audio_97f485129d.mp3?filename=soft-rain-ambient-111154.mp3' },
    { id: 'forest', label: 'Forest', url: 'https://cdn.pixabay.com/download/audio/2021/09/06/audio_34b3d7b938.mp3?filename=forest-wind-and-birds-6881.mp3' },
    { id: 'white', label: 'White Noise', url: 'https://cdn.pixabay.com/download/audio/2022/11/04/audio_9032822295.mp3?filename=white-noise-8129.mp3' }
];

export const INITIAL_DATA = [
    {
        id: 'obg',
        title: 'Obstetrics and Gynecology',
        color: '#3B82F6',
        totalTime: 0
    },
    {
        id: 'peds',
        title: 'Pediatrics',
        color: '#F97316',
        totalTime: 0
    },
    {
        id: 'med',
        title: 'Medicine',
        color: '#10B981',
        totalTime: 0
    }
];
