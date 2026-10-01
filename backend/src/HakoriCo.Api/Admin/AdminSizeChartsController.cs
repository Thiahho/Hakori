using HakoriCo.Api.Admin.Dtos;
using HakoriCo.Api.Data;
using HakoriCo.Api.Products;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HakoriCo.Api.Admin;

[ApiController]
[Route("api/admin/size-charts")]
[Authorize(Policy = "RequireAdminRole")]
public class AdminSizeChartsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetSizeCharts()
    {
        var charts = await db.SizeCharts.Include(c => c.Rows).OrderBy(c => c.Name).ToListAsync();
        return Ok(charts.Select(ToDto));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetSizeChart(Guid id)
    {
        var chart = await db.SizeCharts.Include(c => c.Rows).FirstOrDefaultAsync(c => c.Id == id);
        return chart is null ? NotFound() : Ok(ToDto(chart));
    }

    [HttpPost]
    public async Task<IActionResult> CreateSizeChart(SaveSizeChartRequest request)
    {
        var name = (request.Name ?? "").Trim();
        if (Validate(name, request.Rows) is { } error)
        {
            return BadRequest(new { error });
        }

        if (await db.SizeCharts.AnyAsync(c => c.Name == name))
        {
            return Conflict(new { error = $"Ya existe una plantilla llamada \"{name}\"." });
        }

        var chart = new SizeChart
        {
            Id = Guid.NewGuid(),
            Name = name,
            CreatedAt = DateTimeOffset.UtcNow,
        };
        chart.Rows = ToRows(chart.Id, request.Rows);

        db.SizeCharts.Add(chart);
        await db.SaveChangesAsync();

        return Created($"/api/admin/size-charts/{chart.Id}", ToDto(chart));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateSizeChart(Guid id, SaveSizeChartRequest request)
    {
        var chart = await db.SizeCharts.Include(c => c.Rows).FirstOrDefaultAsync(c => c.Id == id);
        if (chart is null)
        {
            return NotFound();
        }

        var name = (request.Name ?? "").Trim();
        if (Validate(name, request.Rows) is { } error)
        {
            return BadRequest(new { error });
        }

        if (name != chart.Name && await db.SizeCharts.AnyAsync(c => c.Name == name && c.Id != id))
        {
            return Conflict(new { error = $"Ya existe una plantilla llamada \"{name}\"." });
        }

        chart.Name = name;
        db.RemoveRange(chart.Rows);
        var rows = ToRows(chart.Id, request.Rows);
        db.AddRange(rows);
        chart.Rows = rows;

        await db.SaveChangesAsync();

        return Ok(ToDto(chart));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteSizeChart(Guid id)
    {
        var chart = await db.SizeCharts.FirstOrDefaultAsync(c => c.Id == id);
        if (chart is null)
        {
            return NotFound();
        }

        // Products copy a chart's values instead of referencing it, so nothing else changes.
        db.SizeCharts.Remove(chart);
        await db.SaveChangesAsync();

        return Ok(new { ok = true });
    }

    private static string? Validate(string name, List<SizeChartRowDto>? rows)
    {
        if (name.Length == 0)
        {
            return "El nombre es obligatorio.";
        }

        if (rows is null || rows.Count == 0)
        {
            return "Elegí al menos un talle.";
        }

        var sizes = rows.Select(r => (r.Size ?? "").Trim().ToUpperInvariant()).ToList();
        if (sizes.Any(s => s.Length == 0))
        {
            return "Todos los talles tienen que tener nombre.";
        }

        if (sizes.Distinct().Count() != sizes.Count)
        {
            return "Hay talles repetidos.";
        }

        if (rows.Any(r => r.ChestCm < 0 || r.LengthCm < 0 || r.SleeveCm < 0 || r.CurveUnits < 0))
        {
            return "Las medidas y la curva no pueden ser negativas.";
        }

        return null;
    }

    private static List<SizeChartRow> ToRows(Guid chartId, List<SizeChartRowDto> rows) =>
        rows
            .Select(r => new SizeChartRow
            {
                Id = Guid.NewGuid(),
                SizeChartId = chartId,
                Size = r.Size.Trim().ToUpperInvariant(),
                SortOrder = SizeOrder.Index(r.Size),
                ChestCm = r.ChestCm,
                LengthCm = r.LengthCm,
                SleeveCm = r.SleeveCm,
                CurveUnits = r.CurveUnits,
            })
            .ToList();

    private static AdminSizeChartDto ToDto(SizeChart chart) => new(
        chart.Id,
        chart.Name,
        chart.Rows
            .OrderBy(r => r.SortOrder).ThenBy(r => r.Size)
            .Select(r => new SizeChartRowDto(r.Size, r.ChestCm, r.LengthCm, r.SleeveCm, r.CurveUnits))
            .ToList());
}
