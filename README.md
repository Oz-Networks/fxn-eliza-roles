# Eliza Role Plugins

Foundation plugins for the ai16z Eliza framework that enable role-based agent interactions within the FXN SuperSwarm ecosystem.

## Overview

These plugins provide the basic building blocks for creating specialized agent roles within multi-agent systems. They enable agents to divide complex tasks and coordinate their execution through a producer-consumer pattern.

## Plugins

### plugin-fxn-producer

A base plugin for agents that need to generate services or tasks for other agents in the network. This plugin provides the foundational structure for:
- Task decomposition
- Service advertisement
- Task distribution
- Result collection and aggregation

Ideal for implementing coordinator agents, task managers, or any agent that needs to delegate work to other agents in the swarm.

### plugin-fxn-consumer

A base plugin for agents that need to receive and process tasks from other agents. This plugin handles:
- Automated service discovery and subscription using the SuperSwarm marketplace
- Task acceptance
- Status reporting
- Result delivery

For implementing specialized worker agents that focus on specific types of tasks within the swarm.


## Use Cases

These plugins serve as boilerplate for building various agent-based systems, including:
- Marketing campaign orchestration
- Game asset generation
- Design system automation
- Security monitoring
- Blockchain analysis
- Content creation and distribution

## Getting Started

1. Choose the appropriate plugin based on your agent's role:
    - Use `plugin-fxn-producer` for agents that will coordinate or delegate tasks
    - Use `plugin-fxn-consumer` for agents that will execute specific tasks

2. Extend the base plugins to implement your specific use case
3. Configure your agents within the Eliza framework
4. Deploy your agents to the FXN network

Note: for complex coordination tasks, both plugins may be required for a single agent role.

## Development Status

These plugins are currently in development phase and provide illustrative implementations. They are designed to be extended and customized for specific use cases.

## Contributing

We welcome contributions from developers - feel free to submit a PR or discuss with us in the FXN Telegram channel (@fxnworld)
