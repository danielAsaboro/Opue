/**
 * Advanced Statistics Library for Quantitative Analytics
 * Provides statistical functions for correlation, regression, risk metrics, and more.
 */

// ============================================================================
// BASIC STATISTICS
// ============================================================================

export function mean(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

export function variance(values: number[], sample = true): number {
  if (values.length < 2) return 0
  const avg = mean(values)
  const squaredDiffs = values.map((v) => Math.pow(v - avg, 2))
  const divisor = sample ? values.length - 1 : values.length
  return squaredDiffs.reduce((sum, v) => sum + v, 0) / divisor
}

export function standardDeviation(values: number[], sample = true): number {
  return Math.sqrt(variance(values, sample))
}

export function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

export function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const index = (p / 100) * (sorted.length - 1)
  const lower = Math.floor(index)
  const upper = Math.ceil(index)
  if (lower === upper) return sorted[lower]
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower)
}

export function sum(values: number[]): number {
  return values.reduce((acc, v) => acc + v, 0)
}

export function min(values: number[]): number {
  return values.length === 0 ? 0 : Math.min(...values)
}

export function max(values: number[]): number {
  return values.length === 0 ? 0 : Math.max(...values)
}

// ============================================================================
// CORRELATION ANALYSIS
// ============================================================================

export interface CorrelationResult {
  coefficient: number // Pearson's r (-1 to 1)
  pValue: number // Statistical significance
  significant: boolean // p < 0.05
  strength: 'none' | 'weak' | 'moderate' | 'strong'
  direction: 'positive' | 'negative' | 'none'
  sampleSize: number
}

/**
 * Calculate Pearson correlation coefficient between two arrays
 */
export function pearsonCorrelation(x: number[], y: number[]): CorrelationResult {
  const n = Math.min(x.length, y.length)

  if (n < 3) {
    return {
      coefficient: 0,
      pValue: 1,
      significant: false,
      strength: 'none',
      direction: 'none',
      sampleSize: n,
    }
  }

  const xSlice = x.slice(0, n)
  const ySlice = y.slice(0, n)

  const xMean = mean(xSlice)
  const yMean = mean(ySlice)

  let numerator = 0
  let xDenominator = 0
  let yDenominator = 0

  for (let i = 0; i < n; i++) {
    const xDiff = xSlice[i] - xMean
    const yDiff = ySlice[i] - yMean
    numerator += xDiff * yDiff
    xDenominator += xDiff * xDiff
    yDenominator += yDiff * yDiff
  }

  const denominator = Math.sqrt(xDenominator * yDenominator)
  const coefficient = denominator === 0 ? 0 : numerator / denominator

  // Calculate p-value using t-distribution approximation
  const tStatistic = coefficient * Math.sqrt((n - 2) / (1 - coefficient * coefficient))
  const pValue = tDistributionPValue(Math.abs(tStatistic), n - 2)

  // Determine strength
  const absCoef = Math.abs(coefficient)
  let strength: CorrelationResult['strength'] = 'none'
  if (absCoef >= 0.7) strength = 'strong'
  else if (absCoef >= 0.4) strength = 'moderate'
  else if (absCoef >= 0.2) strength = 'weak'

  return {
    coefficient,
    pValue,
    significant: pValue < 0.05,
    strength,
    direction: coefficient > 0.1 ? 'positive' : coefficient < -0.1 ? 'negative' : 'none',
    sampleSize: n,
  }
}

/**
 * Generate correlation matrix for multiple metrics
 */
export function correlationMatrix(
  data: Record<string, number[]>
): Record<string, Record<string, CorrelationResult>> {
  const metrics = Object.keys(data)
  const result: Record<string, Record<string, CorrelationResult>> = {}

  for (const m1 of metrics) {
    result[m1] = {}
    for (const m2 of metrics) {
      result[m1][m2] = pearsonCorrelation(data[m1], data[m2])
    }
  }

  return result
}

// ============================================================================
// LINEAR REGRESSION
// ============================================================================

export interface RegressionResult {
  slope: number
  intercept: number
  rSquared: number // Coefficient of determination (0-1)
  standardError: number // Standard error of the estimate
  slopeStandardError: number // Standard error of the slope
  pValue: number // Significance of the slope
  tStatistic: number
  confidenceInterval: {
    lower: number[] // Lower bound predictions
    upper: number[] // Upper bound predictions
    level: number // Confidence level (e.g., 0.95)
  }
  predictions: number[]
  residuals: number[]
}

/**
 * Perform simple linear regression with confidence intervals
 */
export function linearRegression(
  x: number[],
  y: number[],
  confidenceLevel = 0.95
): RegressionResult {
  const n = Math.min(x.length, y.length)

  if (n < 3) {
    return {
      slope: 0,
      intercept: mean(y),
      rSquared: 0,
      standardError: 0,
      slopeStandardError: 0,
      pValue: 1,
      tStatistic: 0,
      confidenceInterval: { lower: [], upper: [], level: confidenceLevel },
      predictions: y.slice(0, n),
      residuals: new Array(n).fill(0),
    }
  }

  const xSlice = x.slice(0, n)
  const ySlice = y.slice(0, n)

  const xMean = mean(xSlice)
  const yMean = mean(ySlice)

  // Calculate slope and intercept
  let numerator = 0
  let denominator = 0

  for (let i = 0; i < n; i++) {
    numerator += (xSlice[i] - xMean) * (ySlice[i] - yMean)
    denominator += Math.pow(xSlice[i] - xMean, 2)
  }

  const slope = denominator === 0 ? 0 : numerator / denominator
  const intercept = yMean - slope * xMean

  // Calculate predictions and residuals
  const predictions = xSlice.map((xi) => slope * xi + intercept)
  const residuals = ySlice.map((yi, i) => yi - predictions[i])

  // Calculate R-squared
  const ssRes = residuals.reduce((sum, r) => sum + r * r, 0)
  const ssTot = ySlice.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0)
  const rSquared = ssTot === 0 ? 0 : 1 - ssRes / ssTot

  // Calculate standard errors
  const standardError = Math.sqrt(ssRes / (n - 2))
  const slopeStandardError = denominator === 0 ? 0 : standardError / Math.sqrt(denominator)

  // Calculate t-statistic and p-value for slope
  const tStatistic = slopeStandardError === 0 ? 0 : slope / slopeStandardError
  const pValue = tDistributionPValue(Math.abs(tStatistic), n - 2)

  // Calculate confidence intervals
  const tCritical = tCriticalValue(1 - confidenceLevel, n - 2)
  const lower: number[] = []
  const upper: number[] = []

  for (let i = 0; i < n; i++) {
    const xi = xSlice[i]
    const predictionSE =
      standardError * Math.sqrt(1 / n + Math.pow(xi - xMean, 2) / denominator)
    lower.push(predictions[i] - tCritical * predictionSE)
    upper.push(predictions[i] + tCritical * predictionSE)
  }

  return {
    slope,
    intercept,
    rSquared,
    standardError,
    slopeStandardError,
    pValue,
    tStatistic,
    confidenceInterval: { lower, upper, level: confidenceLevel },
    predictions,
    residuals,
  }
}

/**
 * Predict a single value with confidence interval
 */
export function predictWithConfidence(
  regression: RegressionResult,
  xValue: number,
  xData: number[],
  confidenceLevel = 0.95
): { predicted: number; lower: number; upper: number } {
  const predicted = regression.slope * xValue + regression.intercept
  const n = xData.length
  const xMean = mean(xData)
  const denominator = xData.reduce((sum, xi) => sum + Math.pow(xi - xMean, 2), 0)

  const tCritical = tCriticalValue(1 - confidenceLevel, n - 2)
  const predictionSE =
    regression.standardError * Math.sqrt(1 / n + Math.pow(xValue - xMean, 2) / denominator)

  return {
    predicted,
    lower: predicted - tCritical * predictionSE,
    upper: predicted + tCritical * predictionSE,
  }
}

// ============================================================================
// VOLATILITY & RISK METRICS
// ============================================================================

export interface VolatilityMetrics {
  standardDeviation: number
  rollingVolatility: number[] // Rolling std dev over window
  annualizedVolatility: number // Assuming daily data, annualized
  coefficientOfVariation: number // CV = stdDev / mean
  volatilityScore: number // Normalized 0-100 (lower is better)
}

/**
 * Calculate volatility metrics for a time series
 */
export function calculateVolatility(values: number[], windowSize = 7): VolatilityMetrics {
  if (values.length < 2) {
    return {
      standardDeviation: 0,
      rollingVolatility: [],
      annualizedVolatility: 0,
      coefficientOfVariation: 0,
      volatilityScore: 0,
    }
  }

  const stdDev = standardDeviation(values)
  const avg = mean(values)

  // Calculate rolling volatility
  const rollingVolatility: number[] = []
  for (let i = windowSize - 1; i < values.length; i++) {
    const window = values.slice(i - windowSize + 1, i + 1)
    rollingVolatility.push(standardDeviation(window))
  }

  // Annualize (assuming daily data, ~252 trading days)
  const annualizedVolatility = stdDev * Math.sqrt(252)

  // Coefficient of variation
  const coefficientOfVariation = avg === 0 ? 0 : stdDev / Math.abs(avg)

  // Convert to 0-100 score (lower volatility = higher score)
  // Using a sigmoid-like transformation
  const volatilityScore = Math.max(0, Math.min(100, 100 - coefficientOfVariation * 200))

  return {
    standardDeviation: stdDev,
    rollingVolatility,
    annualizedVolatility,
    coefficientOfVariation,
    volatilityScore,
  }
}

export interface DrawdownAnalysis {
  maxDrawdown: number // Largest peak-to-trough decline (%)
  maxDrawdownDuration: number // Days in max drawdown
  currentDrawdown: number // Current drawdown from peak
  recoveryTime: number | null // Days to recover (null if not recovered)
  averageDrawdown: number
  drawdownPeriods: Array<{
    start: number
    end: number
    depth: number
    duration: number
    recovered: boolean
  }>
}

/**
 * Calculate drawdown analysis for a performance series
 */
export function calculateDrawdown(values: number[]): DrawdownAnalysis {
  if (values.length < 2) {
    return {
      maxDrawdown: 0,
      maxDrawdownDuration: 0,
      currentDrawdown: 0,
      recoveryTime: null,
      averageDrawdown: 0,
      drawdownPeriods: [],
    }
  }

  let peak = values[0]
  let maxDrawdown = 0
  let maxDrawdownStart = 0
  let maxDrawdownEnd = 0
  let currentDrawdownStart = 0
  let inDrawdown = false

  const drawdowns: number[] = []
  const drawdownPeriods: DrawdownAnalysis['drawdownPeriods'] = []

  for (let i = 0; i < values.length; i++) {
    const value = values[i]

    if (value > peak) {
      // New peak reached
      if (inDrawdown) {
        // Record the completed drawdown period
        const depth = ((peak - values[maxDrawdownEnd]) / peak) * 100
        drawdownPeriods.push({
          start: currentDrawdownStart,
          end: i - 1,
          depth,
          duration: i - 1 - currentDrawdownStart,
          recovered: true,
        })
      }
      peak = value
      inDrawdown = false
    } else {
      // In drawdown
      const drawdown = ((peak - value) / peak) * 100
      drawdowns.push(drawdown)

      if (!inDrawdown) {
        inDrawdown = true
        currentDrawdownStart = i
      }

      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown
        maxDrawdownStart = currentDrawdownStart
        maxDrawdownEnd = i
      }
    }
  }

  // Handle ongoing drawdown at end of series
  const currentDrawdown = inDrawdown ? ((peak - values[values.length - 1]) / peak) * 100 : 0

  if (inDrawdown) {
    drawdownPeriods.push({
      start: currentDrawdownStart,
      end: values.length - 1,
      depth: currentDrawdown,
      duration: values.length - 1 - currentDrawdownStart,
      recovered: false,
    })
  }

  // Calculate recovery time for max drawdown
  let recoveryTime: number | null = null
  for (let i = maxDrawdownEnd + 1; i < values.length; i++) {
    if (values[i] >= values[maxDrawdownStart]) {
      recoveryTime = i - maxDrawdownEnd
      break
    }
  }

  return {
    maxDrawdown,
    maxDrawdownDuration: maxDrawdownEnd - maxDrawdownStart,
    currentDrawdown,
    recoveryTime,
    averageDrawdown: drawdowns.length > 0 ? mean(drawdowns) : 0,
    drawdownPeriods,
  }
}

export interface SharpeRatio {
  ratio: number // Sharpe-like ratio (mean/stddev)
  interpretation: 'poor' | 'below_average' | 'average' | 'good' | 'excellent'
  percentileRank: number // 0-100
}

/**
 * Calculate Sharpe-like ratio (risk-adjusted performance)
 * For pNode performance, we use mean/stdDev as a risk-adjusted metric
 */
export function calculateSharpeRatio(values: number[], riskFreeRate = 0): SharpeRatio {
  if (values.length < 2) {
    return { ratio: 0, interpretation: 'poor', percentileRank: 0 }
  }

  const avg = mean(values)
  const stdDev = standardDeviation(values)

  // Calculate excess returns over risk-free rate
  const excessReturn = avg - riskFreeRate
  const ratio = stdDev === 0 ? (excessReturn > 0 ? 10 : 0) : excessReturn / stdDev

  // Interpret the ratio
  let interpretation: SharpeRatio['interpretation'] = 'poor'
  if (ratio >= 3) interpretation = 'excellent'
  else if (ratio >= 2) interpretation = 'good'
  else if (ratio >= 1) interpretation = 'average'
  else if (ratio >= 0.5) interpretation = 'below_average'

  // Convert to percentile (0-100)
  // Using a sigmoid transformation centered around ratio of 1
  const percentileRank = Math.min(100, Math.max(0, 50 + 25 * Math.tanh(ratio - 1)))

  return { ratio, interpretation, percentileRank }
}

/**
 * Calculate consistency score (inverse of volatility, normalized 0-100)
 */
export function consistencyScore(values: number[]): number {
  if (values.length < 2) return 100

  const cv = calculateVolatility(values).coefficientOfVariation

  // Transform CV to consistency score
  // CV of 0 = 100 consistency, CV of 0.5+ = low consistency
  return Math.max(0, Math.min(100, 100 * (1 - Math.min(cv * 2, 1))))
}

// ============================================================================
// MOVING AVERAGES
// ============================================================================

export function simpleMovingAverage(values: number[], period: number): number[] {
  if (values.length < period) return []

  const result: number[] = []
  for (let i = period - 1; i < values.length; i++) {
    const window = values.slice(i - period + 1, i + 1)
    result.push(mean(window))
  }
  return result
}

export function exponentialMovingAverage(values: number[], period: number): number[] {
  if (values.length === 0) return []

  const multiplier = 2 / (period + 1)
  const result: number[] = [values[0]]

  for (let i = 1; i < values.length; i++) {
    const ema = (values[i] - result[i - 1]) * multiplier + result[i - 1]
    result.push(ema)
  }

  return result
}

export function weightedMovingAverage(values: number[], period: number): number[] {
  if (values.length < period) return []

  const result: number[] = []
  const weightSum = (period * (period + 1)) / 2

  for (let i = period - 1; i < values.length; i++) {
    let weightedSum = 0
    for (let j = 0; j < period; j++) {
      weightedSum += values[i - period + 1 + j] * (j + 1)
    }
    result.push(weightedSum / weightSum)
  }

  return result
}

// ============================================================================
// NORMALIZATION & SCORING
// ============================================================================

export function zScore(value: number, dataMean: number, dataStdDev: number): number {
  if (dataStdDev === 0) return 0
  return (value - dataMean) / dataStdDev
}

export function zScoreNormalize(values: number[]): number[] {
  const avg = mean(values)
  const stdDev = standardDeviation(values)
  return values.map((v) => zScore(v, avg, stdDev))
}

export function minMaxNormalize(
  values: number[],
  targetMin = 0,
  targetMax = 100
): number[] {
  const dataMin = min(values)
  const dataMax = max(values)
  const range = dataMax - dataMin

  if (range === 0) return values.map(() => (targetMin + targetMax) / 2)

  return values.map((v) => ((v - dataMin) / range) * (targetMax - targetMin) + targetMin)
}

/**
 * Calculate percentile rank of a value within a dataset
 */
export function percentileRank(value: number, values: number[]): number {
  if (values.length === 0) return 50
  const below = values.filter((v) => v < value).length
  return (below / values.length) * 100
}

// ============================================================================
// STATISTICAL TESTS
// ============================================================================

export interface TTestResult {
  tStatistic: number
  pValue: number
  significant: boolean
  meanDifference: number
  degreesOfFreedom: number
}

/**
 * Two-sample t-test (Welch's t-test for unequal variances)
 */
export function tTest(x: number[], y: number[]): TTestResult {
  const n1 = x.length
  const n2 = y.length

  if (n1 < 2 || n2 < 2) {
    return {
      tStatistic: 0,
      pValue: 1,
      significant: false,
      meanDifference: 0,
      degreesOfFreedom: 0,
    }
  }

  const mean1 = mean(x)
  const mean2 = mean(y)
  const var1 = variance(x)
  const var2 = variance(y)

  const meanDifference = mean1 - mean2
  const se = Math.sqrt(var1 / n1 + var2 / n2)

  if (se === 0) {
    return {
      tStatistic: 0,
      pValue: meanDifference === 0 ? 1 : 0,
      significant: meanDifference !== 0,
      meanDifference,
      degreesOfFreedom: n1 + n2 - 2,
    }
  }

  const tStatistic = meanDifference / se

  // Welch-Satterthwaite degrees of freedom
  const df =
    Math.pow(var1 / n1 + var2 / n2, 2) /
    (Math.pow(var1 / n1, 2) / (n1 - 1) + Math.pow(var2 / n2, 2) / (n2 - 1))

  const pValue = tDistributionPValue(Math.abs(tStatistic), df)

  return {
    tStatistic,
    pValue,
    significant: pValue < 0.05,
    meanDifference,
    degreesOfFreedom: df,
  }
}

export interface ConfidenceInterval {
  lower: number
  upper: number
  level: number
  marginOfError: number
}

/**
 * Calculate confidence interval for a mean
 */
export function confidenceInterval(
  dataMean: number,
  dataStdDev: number,
  n: number,
  level = 0.95
): ConfidenceInterval {
  if (n < 2) {
    return { lower: dataMean, upper: dataMean, level, marginOfError: 0 }
  }

  const tCritical = tCriticalValue(1 - level, n - 1)
  const standardError = dataStdDev / Math.sqrt(n)
  const marginOfError = tCritical * standardError

  return {
    lower: dataMean - marginOfError,
    upper: dataMean + marginOfError,
    level,
    marginOfError,
  }
}

// ============================================================================
// TREND ANALYSIS
// ============================================================================

export interface TrendAnalysis {
  direction: 'up' | 'down' | 'neutral'
  strength: number // 0-100 based on R-squared
  momentum: number // Rate of change (slope)
  significance: boolean // Is trend statistically significant
  rSquared: number
  pValue: number
}

/**
 * Analyze trend in time series data
 */
export function analyzeTrend(values: number[]): TrendAnalysis {
  if (values.length < 3) {
    return {
      direction: 'neutral',
      strength: 0,
      momentum: 0,
      significance: false,
      rSquared: 0,
      pValue: 1,
    }
  }

  // Create time index
  const x = values.map((_, i) => i)

  // Perform regression
  const regression = linearRegression(x, values)

  // Determine direction
  let direction: TrendAnalysis['direction'] = 'neutral'
  if (regression.slope > 0.1 && regression.pValue < 0.1) direction = 'up'
  else if (regression.slope < -0.1 && regression.pValue < 0.1) direction = 'down'

  // Strength based on R-squared (0-100)
  const strength = regression.rSquared * 100

  return {
    direction,
    strength,
    momentum: regression.slope,
    significance: regression.pValue < 0.05,
    rSquared: regression.rSquared,
    pValue: regression.pValue,
  }
}

// ============================================================================
// HELPER FUNCTIONS (T-DISTRIBUTION APPROXIMATIONS)
// ============================================================================

/**
 * Approximate t-distribution p-value (two-tailed)
 * Uses a polynomial approximation for reasonable accuracy
 */
function tDistributionPValue(t: number, df: number): number {
  if (df <= 0) return 1
  if (!isFinite(t)) return t > 0 ? 0 : 1

  // For large df, use normal approximation
  if (df > 100) {
    return 2 * (1 - normalCDF(Math.abs(t)))
  }

  // Approximation using incomplete beta function
  const x = df / (df + t * t)
  const a = df / 2
  const b = 0.5

  // Regularized incomplete beta function approximation
  const beta = incompleteBeta(x, a, b)

  return beta
}

/**
 * Approximate t critical value for given alpha and df
 */
function tCriticalValue(alpha: number, df: number): number {
  if (df <= 0) return 0

  // For large df, use normal approximation
  if (df > 100) {
    return normalInverseCDF(1 - alpha / 2)
  }

  // Common critical values lookup (approximation)
  const alphaHalf = alpha / 2

  if (alphaHalf <= 0.005) return 2.576 + 3 / df
  if (alphaHalf <= 0.01) return 2.326 + 2.5 / df
  if (alphaHalf <= 0.025) return 1.96 + 2 / df
  if (alphaHalf <= 0.05) return 1.645 + 1.5 / df

  return 1.282 + 1 / df
}

/**
 * Standard normal CDF approximation
 */
function normalCDF(x: number): number {
  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const p = 0.3275911

  const sign = x < 0 ? -1 : 1
  x = Math.abs(x) / Math.sqrt(2)

  const t = 1.0 / (1.0 + p * x)
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)

  return 0.5 * (1.0 + sign * y)
}

/**
 * Inverse normal CDF approximation (Beasley-Springer-Moro algorithm)
 */
function normalInverseCDF(p: number): number {
  if (p <= 0) return -Infinity
  if (p >= 1) return Infinity

  const a = [
    -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.383577518672690e2,
    -3.066479806614716e1, 2.506628277459239e0,
  ]
  const b = [
    -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1,
    -1.328068155288572e1,
  ]
  const c = [
    -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838e0, -2.549732539343734e0,
    4.374664141464968e0, 2.938163982698783e0,
  ]
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996e0, 3.754408661907416e0]

  const pLow = 0.02425
  const pHigh = 1 - pLow

  let q, r

  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p))
    return (
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    )
  } else if (p <= pHigh) {
    q = p - 0.5
    r = q * q
    return (
      ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
    )
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p))
    return (
      -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    )
  }
}

/**
 * Incomplete beta function approximation
 */
function incompleteBeta(x: number, a: number, b: number): number {
  if (x <= 0) return 0
  if (x >= 1) return 1

  // Use continued fraction expansion
  const bt =
    x === 0 || x === 1
      ? 0
      : Math.exp(
          gammaLn(a + b) -
            gammaLn(a) -
            gammaLn(b) +
            a * Math.log(x) +
            b * Math.log(1 - x)
        )

  if (x < (a + 1) / (a + b + 2)) {
    return (bt * betaCF(x, a, b)) / a
  } else {
    return 1 - (bt * betaCF(1 - x, b, a)) / b
  }
}

/**
 * Continued fraction for incomplete beta
 */
function betaCF(x: number, a: number, b: number): number {
  const maxIterations = 100
  const epsilon = 1e-10

  let m, m2, aa, c, d, del, h

  const qab = a + b
  const qap = a + 1
  const qam = a - 1

  c = 1
  d = 1 - (qab * x) / qap
  if (Math.abs(d) < epsilon) d = epsilon
  d = 1 / d
  h = d

  for (m = 1; m <= maxIterations; m++) {
    m2 = 2 * m
    aa = (m * (b - m) * x) / ((qam + m2) * (a + m2))
    d = 1 + aa * d
    if (Math.abs(d) < epsilon) d = epsilon
    c = 1 + aa / c
    if (Math.abs(c) < epsilon) c = epsilon
    d = 1 / d
    h *= d * c

    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2))
    d = 1 + aa * d
    if (Math.abs(d) < epsilon) d = epsilon
    c = 1 + aa / c
    if (Math.abs(c) < epsilon) c = epsilon
    d = 1 / d
    del = d * c
    h *= del

    if (Math.abs(del - 1) < epsilon) break
  }

  return h
}

/**
 * Log gamma function approximation (Lanczos)
 */
function gammaLn(x: number): number {
  const cof = [
    76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155,
    0.1208650973866179e-2, -0.5395239384953e-5,
  ]

  let y = x
  let tmp = x + 5.5
  tmp -= (x + 0.5) * Math.log(tmp)

  let ser = 1.000000000190015
  for (let j = 0; j < 6; j++) {
    ser += cof[j] / ++y
  }

  return -tmp + Math.log((2.5066282746310005 * ser) / x)
}

// ============================================================================
// SIGNIFICANCE FORMATTING
// ============================================================================

/**
 * Get significance stars based on p-value
 */
export function significanceStars(pValue: number): string {
  if (pValue < 0.001) return '***'
  if (pValue < 0.01) return '**'
  if (pValue < 0.05) return '*'
  return ''
}

/**
 * Format p-value for display
 */
export function formatPValue(pValue: number): string {
  if (pValue < 0.001) return '< 0.001'
  if (pValue < 0.01) return pValue.toFixed(3)
  return pValue.toFixed(2)
}

/**
 * Get interpretation text for correlation strength
 */
export function interpretCorrelation(coefficient: number): string {
  const abs = Math.abs(coefficient)
  const direction = coefficient > 0 ? 'positive' : 'negative'

  if (abs >= 0.8) return `Strong ${direction} correlation`
  if (abs >= 0.6) return `Moderate-to-strong ${direction} correlation`
  if (abs >= 0.4) return `Moderate ${direction} correlation`
  if (abs >= 0.2) return `Weak ${direction} correlation`
  return 'No significant correlation'
}
