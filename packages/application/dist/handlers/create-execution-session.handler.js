import { ExecutionSession } from "@kancode/domain";
import { NotFoundError } from "@kancode/shared";
export class CreateExecutionSessionHandler {
    assignmentRepo;
    executionSessionRepo;
    unitOfWork;
    idGenerator;
    eventPublisher;
    constructor(assignmentRepo, executionSessionRepo, unitOfWork, idGenerator, eventPublisher) {
        this.assignmentRepo = assignmentRepo;
        this.executionSessionRepo = executionSessionRepo;
        this.unitOfWork = unitOfWork;
        this.idGenerator = idGenerator;
        this.eventPublisher = eventPublisher;
    }
    async handle(command, context) {
        return this.unitOfWork.run(async () => {
            const assignment = await this.assignmentRepo.getById(command.payload.assignmentId);
            if (!assignment) {
                throw new NotFoundError(`Assignment ${command.payload.assignmentId} not found`);
            }
            const executionSessionId = this.idGenerator.next();
            const session = ExecutionSession.create({
                id: executionSessionId,
                workspaceId: context.workspaceId,
                assignmentId: assignment.id,
                runtimeName: command.payload.runtimeName,
            });
            session.start();
            assignment.start(executionSessionId);
            await this.assignmentRepo.save(assignment);
            await this.executionSessionRepo.save(session);
            const events = [...assignment.pullEvents(), ...session.pullEvents()];
            if (events.length > 0) {
                await this.eventPublisher.publish(events);
            }
            return { executionSessionId };
        });
    }
}
//# sourceMappingURL=create-execution-session.handler.js.map