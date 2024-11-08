# Use the official Playwright Docker image as the base image
FROM mcr.microsoft.com/playwright:latest

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn

# Copy the rest of the project files
COPY . .

# Install Playwright dependencies
RUN yarn playwright install

# Command to run tests
ENTRYPOINT ["yarn", "run", "test"]
