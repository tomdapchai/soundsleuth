FROM python:3.11.11-alpine3.20

# Set the working directory
WORKDIR /app

# Install build dependencies and Rust using Alpine's package manager
RUN apk add --no-cache rust cargo build-base pkgconfig alsa-lib-dev

# install fpcalc
RUN apk add chromaprint

# Example of using build arg (only for non-sensitive build-time variables)
ARG BUILD_ENV=production
ENV APP_ENV=$BUILD_ENV

# Copy requirements first for better caching
COPY requirements.txt .

# Install dependencies
RUN pip install -r requirements.txt


# Create a non-root user and switch to it
RUN adduser --disabled-password --gecos "" appuser

# Copy the rest of the application
COPY . .

# Change ownership of the app directory to appuser
RUN chown -R appuser:appuser /app

# Set the PATH to include the Python binary directory
ENV PATH="/usr/local/bin:$PATH"

# Use PORT environment variable (Render sets this automatically)
ENV PORT=8000

USER appuser

# Expose the port from the environment variable
EXPOSE 8000

# Start command for production on Render
CMD uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4 




