namespace Server.Application.UseCases;

using Microsoft.EntityFrameworkCore;
using Server.Application.DTOs;
using Server.Application.Interfaces;
using Server.Domain.Entities;
using Server.Domain.Models;
using Server.Domain.Services;

public class BillUseCases
{
    private readonly IAppDbContext _context;
    private readonly IRecurrenceCalculator _recurrenceCalculator;

    public BillUseCases(IAppDbContext context, IRecurrenceCalculator recurrenceCalculator)
    {
        _context = context;
        _recurrenceCalculator = recurrenceCalculator;
    }

    public async Task<BillResponse> CreateBillAsync(Guid userId, CreateBillRequest request, CancellationToken ct = default)
    {
        var id = global::SnowflakeGuid.NewGuid();
        var bill = new Bill(
            id: id,
            userId: userId,
            title: request.Title,
            expectedAmount: request.ExpectedAmount,
            frequency: request.Frequency,
            startDate: request.StartDate,
            dueDate: request.DueDate,
            dayOfMonth: request.DayOfMonth,
            monthOfYear: request.MonthOfYear,
            intervalMonths: request.IntervalMonths,
            notes: request.Notes,
            paymentLink: request.PaymentLink ?? request.BoletoUrl
        );

        _context.Bills.Add(bill);
        await _context.SaveChangesAsync(ct);

        return ToBillResponse(bill);
    }

    public async Task<BillResponse?> GetBillByIdAsync(Guid userId, Guid billId, CancellationToken ct = default)
    {
        var bill = await _context.Bills
            .FirstOrDefaultAsync(b => b.Id == billId && b.UserId == userId, ct);

        return bill == null ? null : ToBillResponse(bill);
    }

    public async Task<BillResponse> UpdateBillAsync(Guid userId, Guid billId, UpdateBillRequest request, CancellationToken ct = default)
    {
        var bill = await _context.Bills
            .FirstOrDefaultAsync(b => b.Id == billId && b.UserId == userId, ct);

        if (bill == null)
            throw new KeyNotFoundException("Bill not found or does not belong to this user.");

        bill.Update(
            title: request.Title,
            expectedAmount: request.ExpectedAmount,
            frequency: request.Frequency,
            startDate: request.StartDate,
            dueDate: request.DueDate,
            dayOfMonth: request.DayOfMonth,
            monthOfYear: request.MonthOfYear,
            intervalMonths: request.IntervalMonths,
            notes: request.Notes,
            paymentLink: request.PaymentLink ?? request.BoletoUrl
        );

        await _context.SaveChangesAsync(ct);

        return ToBillResponse(bill);
    }

    public async Task<IReadOnlyList<BillResponse>> GetUserBillsAsync(Guid userId, CancellationToken ct = default)
    {
        var bills = await _context.Bills
            .Where(b => b.UserId == userId)
            .OrderByDescending(b => b.CreatedAtUtc)
            .ToListAsync(ct);

        return bills.Select(ToBillResponse).ToList();
    }

    public async Task<IReadOnlyList<BillOccurrenceResponse>> GetOccurrencesAsync(
        Guid userId,
        BillFilter filter,
        DateOnly referenceDate,
        CancellationToken ct = default)
    {
        var bills = await _context.Bills
            .Where(b => b.UserId == userId)
            .Include(b => b.Executions)
            .ToListAsync(ct);

        var occurrences = _recurrenceCalculator.CalculateOccurrences(bills, filter, referenceDate);

        return occurrences.Select(o => new BillOccurrenceResponse(
            BillId: o.BillId,
            BillTitle: o.BillTitle,
            ExpectedAmount: o.ExpectedAmount,
            Frequency: o.Frequency,
            DueDate: o.DueDate,
            IsPaid: o.IsPaid,
            ExecutionId: o.ExecutionId,
            PaymentDate: o.PaymentDate,
            PaidAmount: o.PaidAmount,
            Notes: o.Notes,
            PaymentLink: o.PaymentLink
        )).ToList();
    }

    public async Task<BillExecutionResponse> RegisterExecutionAsync(
        Guid userId,
        Guid billId,
        RegisterExecutionRequest request,
        CancellationToken ct = default)
    {
        var bill = await _context.Bills
            .FirstOrDefaultAsync(b => b.Id == billId && b.UserId == userId, ct);

        if (bill == null)
            throw new KeyNotFoundException("Bill not found or does not belong to this user.");

        var executionId = global::SnowflakeGuid.NewGuid();
        var execution = new BillExecution(
            id: executionId,
            billId: billId,
            paymentDate: request.PaymentDate,
            paidAmount: request.PaidAmount,
            referenceDueDate: request.ReferenceDueDate,
            notes: request.Notes
        );

        _context.BillExecutions.Add(execution);
        await _context.SaveChangesAsync(ct);

        return new BillExecutionResponse(
            Id: execution.Id,
            BillId: execution.BillId,
            PaymentDate: execution.PaymentDate,
            PaidAmount: execution.PaidAmount,
            ReferenceDueDate: execution.ReferenceDueDate,
            Notes: execution.Notes,
            CreatedAtUtc: execution.CreatedAtUtc
        );
    }

    public async Task DeleteExecutionAsync(Guid userId, Guid executionId, CancellationToken ct = default)
    {
        var execution = await _context.BillExecutions
            .Include(e => e.Bill)
            .FirstOrDefaultAsync(e => e.Id == executionId && e.Bill != null && e.Bill.UserId == userId, ct);

        if (execution == null)
            throw new KeyNotFoundException("Execution not found or not owned by user.");

        _context.BillExecutions.Remove(execution);
        await _context.SaveChangesAsync(ct);
    }

    public async Task DeleteBillAsync(Guid userId, Guid billId, CancellationToken ct = default)
    {
        var bill = await _context.Bills
            .Include(b => b.Executions)
            .FirstOrDefaultAsync(b => b.Id == billId && b.UserId == userId, ct);

        if (bill == null)
            throw new KeyNotFoundException("Bill not found or does not belong to this user.");

        _context.BillExecutions.RemoveRange(bill.Executions);
        _context.Bills.Remove(bill);
        await _context.SaveChangesAsync(ct);
    }

    private static BillResponse ToBillResponse(Bill b) => new(
        Id: b.Id,
        UserId: b.UserId,
        Title: b.Title,
        ExpectedAmount: b.ExpectedAmount,
        Frequency: b.Frequency,
        StartDate: b.StartDate,
        DueDate: b.DueDate,
        DayOfMonth: b.DayOfMonth,
        MonthOfYear: b.MonthOfYear,
        IntervalMonths: b.IntervalMonths,
        Notes: b.Notes,
        CreatedAtUtc: b.CreatedAtUtc,
        PaymentLink: b.PaymentLink
    );
}
