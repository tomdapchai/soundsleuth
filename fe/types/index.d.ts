export interface PlaylistResult {
    results: string[];
    playlist: string;
}

export interface AuthResponse {
    status: string;
    token: string;
    userId: string;
}
