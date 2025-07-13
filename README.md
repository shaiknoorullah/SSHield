<!-- @format -->

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
git clone https://github.com/shaiknoorullah/sshield.git
cd sshield

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
sshield init

# Generate a new SSH key
sshield key generate --name my-server

# Add a server
sshield server add --name web-server --hostname example.com --username admin

# Connect to a server
sshield connect web-server

# Start SSH agent and add project keys
sshield agent start
sshield agent add-project-keys

# Create an SSH tunnel
sshield tunnel web-server --remote-host db.internal --remote-port 5432
```

## Project Structure

The application uses a project-based approach to organize your SSH keys and servers:

- Each project has its own set of keys and server definitions
- Keys are stored securely with proper permissions
- Projects can be easily switched with `sshield project set-active`
- SSH config is automatically updated with your project servers

## Command Reference

### General

- `sshield init`: Initialize the application
- `sshield status`: Show application status
- `sshield dashboard`: Open the interactive dashboard (coming soon)

### Key Management

- `sshield key generate`: Generate a new SSH key
- `sshield key list`: List all keys in the current project
- `sshield key show <key-id>`: Show key details
- `sshield key public <key-id>`: Show public key
- `sshield key delete <key-id>`: Delete a key
- `sshield key add <key-id>`: Add key to SSH agent
- `sshield key import <path>`: Import an existing key

### Project Management

- `sshield project create <name>`: Create a new project
- `sshield project list`: List all projects
- `sshield project show [id]`: Show project details
- `sshield project set-active <id>`: Set the active project
- `sshield project update <id>`: Update project details
- `sshield project delete <id>`: Delete a project
- `sshield project update-ssh-config`: Update SSH config with project servers
- `sshield project export <id>`: Export project data
- `sshield project import <path>`: Import project data

### Server Management

- `sshield server add`: Add a server to the current project
- `sshield server list`: List all servers in the current project
- `sshield server delete <id>`: Delete a server

### SSH Agent Management

- `sshield agent start`: Start the SSH agent
- `sshield agent stop`: Stop the SSH agent
- `sshield agent status`: Show agent status
- `sshield agent add-project-keys`: Add all project keys to agent
- `sshield agent remove-all-keys`: Remove all keys from agent
- `sshield agent generate-startup-script`: Generate agent startup script
- `sshield agent export-env`: Export agent environment variables

### Connection Management

- `sshield connect <server>`: Connect to a server
- `sshield tunnel <server>`: Create an SSH tunnel
- `sshield ssh-command <server>`: Generate an SSH command

## Security Features

- Secure key generation with strong parameters
- Proper file permissions for all created files
- Project-based namespaces for security isolation
- SSH agent timeout for added security
- Automatic backup of SSH config files

## License

MIT
