FROM node:20-alpine

# No need to set the working directory if it's the same as where the Dockerfile is
# WORKDIR /usr/src/app

# Copy application files
COPY . .

# Install dependencies
RUN npm install

# Expose port
EXPOSE 8000

# Command to run the application
CMD ["node", "start"]
