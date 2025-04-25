# SSH Manager

A beautiful, interactive CLI application for secure SSH key management with project-based namespaces.

## Features

- **Project-Based Key Management**: Organize SSH keys by project
- **Secure Encryption**: Generate keys with strong security parameters
- **SSH Agent Integration**: Easily manage your SSH agent and keys
- **Server Management**: Track and connect to servers with ease
- **Interactive Interface**: Beautiful TUI with colors and animations
- **SSH Config Integration**: Automatically update your SSH config
- **Import/Export**: Share project configurations securely
- **SSH Tunneling**: Create and manage SSH tunnels

## Installation

```bash
# Clone the repository
git clone https://github.com/shaiknoorullah/ssh-manager.git
cd ssh-manager

# Install dependencies
npm install

# Build the project
npm run build

# Create a global symlink
npm link
```

## Usage

```bash
# Initialize the application
ssh-manager init

# Generate a new SSH key
ssh-manager key generate --name my-server

# Add a server
ssh-manager server add --name web-server --hostname example.com --username admin

# Connect to a server
ssh-manager connect web-server

# Start SSH agent and add project keys
ssh-manager agent start
ssh-manager agent add-project-keys

# Create an SSH tunnel
ssh-manager tunnel web-server --remote-host db.internal --remote-port 5432
```

## Project Structure

The application uses a project-based approach to organize your SSH keys and servers:

- Each project has its own set of keys and server definitions
- Keys are stored securely with proper permissions
- Projects can be easily switched with `ssh-manager project set-active`
- SSH config is automatically updated with your project servers

## Command Reference

### General

- `ssh-manager init`: Initialize the application
- `ssh-manager status`: Show application status
- `ssh-manager dashboard`: Open the interactive dashboard (coming soon)

### Key Management

- `ssh-manager key generate`: Generate a new SSH key
- `ssh-manager key list`: List all keys in the current project
- `ssh-manager key show <key-id>`: Show key details
- `ssh-manager key public <key-id>`: Show public key
- `ssh-manager key delete <key-id>`: Delete a key
- `ssh-manager key add <key-id>`: Add key to SSH agent
- `ssh-manager key import <path>`: Import an existing key

### Project Management

- `ssh-manager project create <name>`: Create a new project
- `ssh-manager project list`: List all projects
- `ssh-manager project show [id]`: Show project details
- `ssh-manager project set-active <id>`: Set the active project
- `ssh-manager project update <id>`: Update project details
- `ssh-manager project delete <id>`: Delete a project
- `ssh-manager project update-ssh-config`: Update SSH config with project servers
- `ssh-manager project export <id>`: Export project data
- `ssh-manager project import <path>`: Import project data

### Server Management

- `ssh-manager server add`: Add a server to the current project
- `ssh-manager server list`: List all servers in the current project
- `ssh-manager server delete <id>`: Delete a server

### SSH Agent Management

- `ssh-manager agent start`: Start the SSH agent
- `ssh-manager agent stop`: Stop the SSH agent
- `ssh-manager agent status`: Show agent status
- `ssh-manager agent add-project-keys`: Add all project keys to agent
- `ssh-manager agent remove-all-keys`: Remove all keys from agent
- `ssh-manager agent generate-startup-script`: Generate agent startup script
- `ssh-manager agent export-env`: Export agent environment variables

### Connection Management

- `ssh-manager connect <server>`: Connect to a server
- `ssh-manager tunnel <server>`: Create an SSH tunnel
- `ssh-manager ssh-command <server>`: Generate an SSH command

## Security Features

- Secure key generation with strong parameters
- Proper file permissions for all created files
- Project-based namespaces for security isolation
- SSH agent timeout for added security
- Automatic backup of SSH config files

## License

MIT