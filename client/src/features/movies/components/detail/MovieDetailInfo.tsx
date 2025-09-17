"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { ITMDBMovieDetail } from "@/features/movies/movie.type";

interface MovieDetailInfoProps {
  movie: ITMDBMovieDetail;
}

export function MovieDetailInfo({ movie }: MovieDetailInfoProps) {
  const formatCurrency = (amount: number) => {
    if (amount === 0) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="container py-8 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Production Info */}
          <Card>
            <CardHeader>
              <CardTitle>Production Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                    Release Date
                  </h4>
                  <p>{formatDate(movie.release_date)}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                    Status
                  </h4>
                  <Badge variant="outline">{movie.status}</Badge>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                    Budget
                  </h4>
                  <p>{formatCurrency(movie.budget)}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                    Revenue
                  </h4>
                  <p>{formatCurrency(movie.revenue)}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                    Original Language
                  </h4>
                  <p className="capitalize">{movie.original_language}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                    IMDB ID
                  </h4>
                  <a
                    href={`https://www.imdb.com/title/${movie.imdb_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {movie.imdb_id}
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Production Companies */}
          {movie.production_companies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Production Companies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {movie.production_companies.map((company) => (
                    <div
                      key={company.id}
                      className="flex items-center gap-3 p-3 rounded-lg border"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold">{company.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {company.origin_country}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Languages */}
          <Card>
            <CardHeader>
              <CardTitle>Languages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {movie.spoken_languages.map((language, index) => (
                  <div key={language.iso_639_1}>
                    <p className="font-medium">{language.english_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {language.name}
                    </p>
                    {index < movie.spoken_languages.length - 1 && (
                      <Separator className="mt-2" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Production Countries */}
          <Card>
            <CardHeader>
              <CardTitle>Production Countries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {movie.production_countries.map((country, index) => (
                  <div key={country.iso_3166_1}>
                    <p className="font-medium">{country.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {country.iso_3166_1}
                    </p>
                    {index < movie.production_countries.length - 1 && (
                      <Separator className="mt-2" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                  Popularity Score
                </h4>
                <p>{movie.popularity.toFixed(1)}</p>
              </div>
              <Separator />
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                  Adult Content
                </h4>
                <Badge variant={movie.adult ? "destructive" : "secondary"}>
                  {movie.adult ? "Yes" : "No"}
                </Badge>
              </div>
              <Separator />
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                  Video Available
                </h4>
                <Badge variant={movie.video ? "default" : "secondary"}>
                  {movie.video ? "Yes" : "No"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
