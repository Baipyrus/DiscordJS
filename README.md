# Setup

## Requirements

- NodeJS (LTS; including NPM): <https://nodejs.org/en/download/>
- Git: <https://git-scm.com/downloads>

## Download

Download the current [source code here](https://git.baipyr.us/Baipyrus/DiscordJS-Example/archive/main.zip).

Or clone the repository manually:

```bash
git clone https://git.baipyr.us/Baipyrus/DiscordJS-Example.git
```

## Installation

Install the required dependencies:

```bash
npm install
```

## Running

Start the bot with:

```bash
npm run start
```

## Usage

Discord utilizes different types of commands to interface with bots.
The following explanations aim to explain these types.

### Slash Commands

Simple text-based commands. Can be entered in any Text-Based-Channel.

Prefix message with a "Slash" (`/`) and begin typing the name of the command!
This prefix and the styling as a code snippet will be used to highlight
Slash Commands in this message.

For clarification, this will also highlight command options as
"Slash Command only" by prefixing them with an underscore (`_`)

### Context Menu Commands

"One click" commands. Listed under context (right click) menus,
under the group "Apps".

Ideally, clicking on Users or Messages, you can apply any type of command with the
press of a button. Comes with the downside of lacking further input capabilities.

Under the list of names of any given command, there may be a quoted string.
These are meant to highlight context menu capabilities for the current command,
by showcasing the commands name in the quote.

## Reaction/Self Roles

### Name

`/self_roles`

### Description

Enables users to self assign roles by reacting to a message,
utilizing a bot for automated tasks

### Subcommands

#### create

Full names:

- `/self_roles create`

Description:

The bot writes a message with the given contents in the current channel,
and then registers said message for self roles

Options:

- \_text: String

#### register

Full names:

- `/self_roles register`
- "Register self roles"

Description:

Fetches any existing message and registers it for self roles directly

Options:

- \_id: Discord Message ID

#### remove

Full names:

- `/self_roles remove`
- "Remove self roles"

Description:

Fetches any existing message, looks if it is registered for self roles and
then unregisters it

Options:

- \_id: Discord Message ID

#### add

Full names:

- `/self_roles add`
- "Add role emoji pair"

Description:

Adds a new Role-Emoji-Pair to a given message. Reacting to said message with
the given emoji yields the given role

Options:

- \_id: Discord Message ID
- role: Discord Role
- emoji: Unicode [or if accessible, a custom] Emoji

### Automated tasks

Registered Messages will automatically:

- be unregistered during deletion
- be edited in case the bot owns said message. It will explain the given
  Role-Emoji-Pairs every time a new pair is added.

## Custom Voice Chat

### Name

`/custom_vc`

### Description

Enables users to create a custom, temporary voice chat with full control over it

### Subcommands

#### create

Full names:

- `/custom_vc create`

Description:

The bot creates a new voice channel with the given name and
registers said channel for custom VC creation

Options:

- \_name: String

#### register

Full names:

- `/custom_vc register`

Description:

Fetches any existing voice channel and registers it for custom VC creation directly

Options:

- \_channel: Discord Channel

#### remove

Full names:

- `/custom_vc remove`

Description:

Fetches any voice channel, looks if it is registered for custom VC creation and
then unregisters it

Options:

- \_channel: Discord Channel

### Automated tasks

Registered Voice Channels will automatically:

- be unregistered during deletion
- be deleted once all users left said channel
- grant full control over permissions, only within said channel, to the author

## New member roles

### Name

`/member_roles`

### Description

Registers roles to be assigned to new members

### Subcommands

#### add

Full names:

- `/member_roles add`

Description:

Adds a new Role to be assigned to new members

Options:

- role: Discord Role

#### remove

Full names:

- `/member_roles remove`

Description:

Removes a Role from being assigned to new members

Options:

- role: Discord Role

### Automated tasks

Registered roles will automatically be assigned to new members

## TO-DO List

> **NOTE**
> These lists can and will easily be appended to in the future.
> Any and all feedback is greatly appreciated!

### Planned features

- Automated alerts/reminders
- Removing pairs on reaction/self roles
- Autocomplete on ID input in slash commands

### Quirks/Bugs

- Custom VC not working in global space
- Categories with Custom VC channel in them need explicit permissions

### Changes

None
