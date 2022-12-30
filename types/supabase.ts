export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  graphql: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      comment_directive: {
        Args: { comment_: string }
        Returns: Json
      }
      exception: {
        Args: { message: string }
        Returns: string
      }
      get_schema_version: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      resolve: {
        Args: {
          query: string
          variables: Json
          operationName: string
          extensions: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName: string
          query: string
          variables: Json
          extensions: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      competition_classes: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
      }
      competition_entries: {
        Row: {
          id: number
          name: string
          car_name: string
          car_model_name: string
          competition_class_id: number
          competition_id: number
          display_id: string | null
        }
        Insert: {
          id?: number
          name: string
          car_name: string
          car_model_name: string
          competition_class_id: number
          competition_id: number
          display_id?: string | null
        }
        Update: {
          id?: number
          name?: string
          car_name?: string
          car_model_name?: string
          competition_class_id?: number
          competition_id?: number
          display_id?: string | null
        }
      }
      competition_results: {
        Row: {
          id: number
          created_at: string
          result_kind: string
          competition_entry_id: number | null
          time_ms: number
          replay_id: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          result_kind: string
          competition_entry_id?: number | null
          time_ms: number
          replay_id?: string | null
        }
        Update: {
          id?: number
          created_at?: string
          result_kind?: string
          competition_entry_id?: number | null
          time_ms?: number
          replay_id?: string | null
        }
      }
      competitions: {
        Row: {
          id: number
          created_at: string | null
          title: string
          series_id: number | null
        }
        Insert: {
          id?: number
          created_at?: string | null
          title: string
          series_id?: number | null
        }
        Update: {
          id?: number
          created_at?: string | null
          title?: string
          series_id?: number | null
        }
      }
      serieses: {
        Row: {
          id: number
          title: string | null
        }
        Insert: {
          id?: number
          title?: string | null
        }
        Update: {
          id?: number
          title?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          id: string
          name: string
          owner: string | null
          created_at: string | null
          updated_at: string | null
          public: boolean | null
        }
        Insert: {
          id: string
          name: string
          owner?: string | null
          created_at?: string | null
          updated_at?: string | null
          public?: boolean | null
        }
        Update: {
          id?: string
          name?: string
          owner?: string | null
          created_at?: string | null
          updated_at?: string | null
          public?: boolean | null
        }
      }
      migrations: {
        Row: {
          id: number
          name: string
          hash: string
          executed_at: string | null
        }
        Insert: {
          id: number
          name: string
          hash: string
          executed_at?: string | null
        }
        Update: {
          id?: number
          name?: string
          hash?: string
          executed_at?: string | null
        }
      }
      objects: {
        Row: {
          id: string
          bucket_id: string | null
          name: string | null
          owner: string | null
          created_at: string | null
          updated_at: string | null
          last_accessed_at: string | null
          metadata: Json | null
          path_tokens: string[] | null
        }
        Insert: {
          id?: string
          bucket_id?: string | null
          name?: string | null
          owner?: string | null
          created_at?: string | null
          updated_at?: string | null
          last_accessed_at?: string | null
          metadata?: Json | null
          path_tokens?: string[] | null
        }
        Update: {
          id?: string
          bucket_id?: string | null
          name?: string | null
          owner?: string | null
          created_at?: string | null
          updated_at?: string | null
          last_accessed_at?: string | null
          metadata?: Json | null
          path_tokens?: string[] | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      extension: {
        Args: { name: string }
        Returns: string
      }
      filename: {
        Args: { name: string }
        Returns: string
      }
      foldername: {
        Args: { name: string }
        Returns: string[]
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: { size: number; bucket_id: string }[]
      }
      search: {
        Args: {
          prefix: string
          bucketname: string
          limits: number
          levels: number
          offsets: number
          search: string
          sortcolumn: string
          sortorder: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
